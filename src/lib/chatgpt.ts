import { OpenAI } from 'openai';
import { openai_client as OpenAIClient, logger } from './config';

// Définition des types
interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ResponseFormatText {
    type: "text";
}

interface ResponseFormatJSON {
    type: "json_object";
}

type ResponseFormat = ResponseFormatText | ResponseFormatJSON;

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
        
        const systemMessage: Message = {
            role: 'system',
            content: "You are Constellation, a helpful assistant created by Mathias Garcia!."
        };
        
        if (instructions) {
            systemMessage.content += ` Tu vas respecter radicalement ces instructions : ${instructions}`;
        }
        messages.push(systemMessage);

        if (context) {
            messages.push(...context);
        }

        if (!messages.length || messages[messages.length - 1].content !== input) {
            messages.push({
                role: 'user',
                content: input
            });
        }

        console.info(`Messages envoyés: ${messages.length}`);
        
        const baseParams = {
            model,
            messages,
            temperature,
            max_tokens,
            top_p,
            frequency_penalty,
            presence_penalty,
            response_format
        };

        if (streaming) {
            const stream = await OpenAIClient.chat.completions.create({
                ...baseParams,
                stream: true,
            });
            return streamResponse(stream);
        } else {
            const response = await OpenAIClient.chat.completions.create({
                ...baseParams,
                stream: false,
            });
            
            const content = response.choices[0].message.content;
            if (content === null) {
                throw new Error("Response content is null");
            }
            return content;
        }
    } catch (error) {
        const errorMsg = `Erreur OpenAI: ${error instanceof Error ? error.message : String(error)}`;
        logger.error("Erreur rencontrée lors de l'appel à ChatGPT.");
        return errorMsg;
    }
}

async function* streamResponse(stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>): AsyncGenerator<string, void, unknown> {
    try {
        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                yield chunk.choices[0].delta.content;
                if ((window as any).MathJax) {
                    (window as any).MathJax.typesetPromise([]);
                }
            }
        }
    } catch (error) {
        const errorMsg = `Erreur pendant le streaming: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        yield errorMsg;
    }
}

export { chatgpt, streamResponse };