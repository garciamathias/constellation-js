import { OpenAI } from 'openai';

// Configuration du client OpenAI
export const openai_client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Permet l'utilisation côté client
});

// Simple logger pour le client
export const logger = {
    info: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
    warn: (message: string) => console.warn(message)
};