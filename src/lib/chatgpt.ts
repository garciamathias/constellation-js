import { openai_client as OpenAIClient, logger } from './config';
import type { ChatCompletionCreateParams } from 'openai/resources/chat';

// Définition des types
interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ResponseFormat {
    type: string;
}

type CompletionParams = ChatCompletionCreateParams & {
    stream: boolean;
    temperature: number;
    max_tokens?: number;
    max_completion_tokens?: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    response_format: ResponseFormat;
};

async function chatgpt(
    input: string,
    context?: Message[],
    instructions?: string,
    model: string = 'gpt-4o',
    streaming: boolean = false,
    temperature: number = 1,
    max_tokens: number = 2048,
    top_p: number = 1,
    frequency_penalty: number = 0,
    presence_penalty: number = 0,
    response_format: ResponseFormat = { type: "text" }
): Promise<string | AsyncGenerator<string, void, unknown>> {
    
    logger.info(`=== Nouvelle requête ChatGPT - Prompt: ${input} ===`);
    
    if (typeof input !== 'string') {
        logger.error("Le prompt doit être une chaîne de caractères.");
        return "Le prompt doit être une chaîne de caractères.";
    }

    try {
        const messages: Message[] = [];
        
        if (model !== 'o1-preview') {
            const systemMessage: Message = {
                role: 'system',
                content: "You are Constellation, a helpful assistant created by Mathias Garcia."
            };
            
            if (instructions) {
                systemMessage.content += ` Tu vas respecter radicalement ces instructions : ${instructions}`;
            }
            messages.push(systemMessage);
        }

        if (context) {
            context.forEach(msg => {
                const content = Array.isArray(msg.content) 
                    ? msg.content[0].text 
                    : msg.content;
                messages.push({
                    role: msg.role,
                    content: content
                });
            });
        }

        if (!messages.length || messages[messages.length - 1].content !== input) {
            messages.push({
                role: 'user',
                content: input
            });
        }

        console.info(`Messages envoyés: ${messages.length}`);
        
        const completionParams: CompletionParams = {
            model,
            messages,
            stream: streaming,
            temperature,
            top_p,
            frequency_penalty,
            presence_penalty,
            response_format
        };

        if (model === 'o1-preview') {
            completionParams.max_completion_tokens = max_tokens;
        } else {
            completionParams.max_tokens = max_tokens;
        }

        const response = await OpenAIClient.chat.completions.create(completionParams);
        
        if (streaming) {
            return streamResponse(response);
        } else {
            return response.choices[0].message.content;
        }
    } catch (error) {
        const errorMsg = `Erreur OpenAI: ${error instanceof Error ? error.message : String(error)}`;
        logger.error("Erreur rencontrée lors de l'appel à ChatGPT.");
        return errorMsg;
    }
}

async function* streamResponse(response: AsyncIterable<any>): AsyncGenerator<string, void, unknown> {
    try {
        for await (const chunk of response) {
            if (chunk.choices[0]?.delta?.content) {
                yield chunk.choices[0].delta.content;
            }
        }
    } catch (error) {
        const errorMsg = `Erreur pendant le streaming: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        yield errorMsg;
    }
}

export { chatgpt, streamResponse };