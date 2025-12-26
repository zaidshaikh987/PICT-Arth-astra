import { GoogleGenAI } from "@google/genai";
import { COMPANY_KNOWLEDGE } from "../knowledge/company-brain";

/**
 * Google Text Embeddings Engine
 * Uses text-embedding-004 model for semantic vector generation
 */

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export interface EmbeddingResult {
    text: string;
    embedding: number[];
    id: string;
}

/**
 * Generate embeddings for a single text using Google's text-embedding-004
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const result = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: text,
        });

        if (!result.embeddings || result.embeddings.length === 0) {
            throw new Error("No embeddings returned");
        }

        return result.embeddings[0].values || [];
    } catch (error: any) {
        console.error("Embedding generation error:", error);
        // Return zero vector as fallback
        return new Array(768).fill(0);
    }
}

/**
 * Generate embeddings for all knowledge base entries
 */
export async function generateKnowledgeEmbeddings(): Promise<EmbeddingResult[]> {
    console.log("🧠 Generating embeddings for knowledge base...");

    const results: EmbeddingResult[] = [];

    for (const item of COMPANY_KNOWLEDGE) {
        const embedding = await generateEmbedding(item.content);
        results.push({
            id: item.id,
            text: item.content,
            embedding,
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Generated ${results.length} embeddings`);
    return results;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
