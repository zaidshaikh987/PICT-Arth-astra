import { GoogleGenAI } from "@google/genai";
import { getNextApiKey, markKeyExhausted } from "./key-rotation";

/**
 * Singleton Gemini Client
 * Uses key-rotation for API key management
 * All files should import from here instead of creating their own GoogleGenAI instance
 */

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
    if (!_client) {
        const apiKey = getNextApiKey();
        _client = new GoogleGenAI({ apiKey });
    }
    return _client;
}

/**
 * Reset the client (e.g., after a 429 error to rotate key)
 */
export function rotateGeminiClient(): GoogleGenAI {
    markKeyExhausted();
    const apiKey = getNextApiKey();
    _client = new GoogleGenAI({ apiKey });
    return _client;
}

/**
 * Generate content with automatic key rotation on quota errors
 */
export async function generateWithRotation(
    model: string,
    prompt: string,
    config?: any
): Promise<string> {
    const modelsToTry = [model, "gemini-2.0-flash-exp"];

    for (const modelName of modelsToTry) {
        try {
            const client = getGeminiClient();
            const result = await client.models.generateContent({
                model: modelName,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: config || { temperature: 0.7, maxOutputTokens: 2000 },
            });

            const text = result.text;
            if (!text) throw new Error("Empty response from AI");
            return text;
        } catch (error: any) {
            const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");

            if (isQuotaError && modelName !== modelsToTry[modelsToTry.length - 1]) {
                console.warn(`[GeminiClient] Quota exceeded for ${modelName}, rotating key and retrying...`);
                rotateGeminiClient();
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            throw error;
        }
    }
    throw new Error("All models failed");
}
