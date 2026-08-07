import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const modelNames = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-2.0-flash,gemini-1.5-flash")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

function shouldTryNextModel(error) {
    const status = Number(error?.status || error?.code || 0);
    const message = String(error?.message || error || '').toLowerCase();

    return (
        status === 404 ||
        status === 429 ||
        status === 503 ||
        message.includes('not found') ||
        message.includes('no longer available') ||
        message.includes('quota exceeded') ||
        message.includes('resource_exhausted') ||
        message.includes('unavailable')
    );
}

export async function askGemini(prompt, config = {}){

    let lastError = null;

    for (const modelName of modelNames) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config
            });

            return response.text;
        } catch (error) {
            lastError = error;

            if (!shouldTryNextModel(error)) {
                throw error;
            }
        }
    }

    throw lastError;
}