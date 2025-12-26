import { generateEmbedding, cosineSimilarity, EmbeddingResult, generateKnowledgeEmbeddings } from "./embeddings";

/**
 * In-Memory Vector Store for Semantic Search
 * This implements RAG (Retrieval-Augmented Generation) using Google's text-embedding-004
 */

export class VectorStore {
    private vectors: EmbeddingResult[] = [];
    private initialized = false;

    /**
     * Initialize the vector store with knowledge base embeddings
     */
    async initialize() {
        if (this.initialized) return;

        console.log("🔧 Initializing Vector Store...");
        this.vectors = await generateKnowledgeEmbeddings();
        this.initialized = true;
        console.log("✅ Vector Store ready with", this.vectors.length, "entries");
    }

    /**
     * Semantic search: Find most relevant knowledge entries for a query
     */
    async search(query: string, topK: number = 3): Promise<Array<{ text: string; score: number; id: string }>> {
        if (!this.initialized) {
            await this.initialize();
        }

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Calculate similarity scores
        const results = this.vectors.map(vector => ({
            id: vector.id,
            text: vector.text,
            score: cosineSimilarity(queryEmbedding, vector.embedding),
        }));

        // Sort by score (descending) and return top K
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
     * Get context for RAG: Returns the most relevant knowledge text for a query
     */
    async getContext(query: string): Promise<string> {
        const results = await this.search(query, 2);

        if (results.length === 0) return "";

        return results
            .map(r => `[Relevance: ${(r.score * 100).toFixed(1)}%]\n${r.text}`)
            .join("\n\n---\n\n");
    }
}

// Singleton instance
export const vectorStore = new VectorStore();
