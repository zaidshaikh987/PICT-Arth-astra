/**
 * API Key Rotation Manager
 * Distributes load across multiple Gemini API keys to avoid quota exhaustion
 */

// Load all API keys from environment (comma-separated)
const API_KEYS = (process.env.GOOGLE_API_KEYS || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0);

let currentKeyIndex = 0;
const exhaustedKeys = new Set<number>();
const keyLastUsed = new Map<number, number>();

/**
 * Get the next available API key (round-robin with exhaustion tracking)
 */
export function getNextApiKey(): string {
    if (API_KEYS.length === 0) {
        throw new Error("No API keys configured. Set GOOGLE_API_KEYS in .env.local");
    }

    // Reset exhausted keys after 60 seconds (quota usually resets per minute)
    const now = Date.now();
    exhaustedKeys.forEach((index) => {
        const lastUsed = keyLastUsed.get(index) || 0;
        if (now - lastUsed > 60000) {
            exhaustedKeys.delete(index);
        }
    });

    // Find next available key
    let attempts = 0;
    while (attempts < API_KEYS.length) {
        const index = currentKeyIndex % API_KEYS.length;
        currentKeyIndex++;

        if (!exhaustedKeys.has(index)) {
            keyLastUsed.set(index, now);
            console.log(`🔑 Using API Key ${index + 1}/${API_KEYS.length}`);
            return API_KEYS[index];
        }
        attempts++;
    }

    // All keys exhausted - return least recently used
    console.warn("⚠️ All API keys exhausted. Trying oldest key...");
    exhaustedKeys.clear();
    return API_KEYS[0];
}

/**
 * Mark current key as exhausted (call this on 429 errors)
 */
export function markKeyExhausted(): void {
    const exhaustedIndex = (currentKeyIndex - 1 + API_KEYS.length) % API_KEYS.length;
    exhaustedKeys.add(exhaustedIndex);
    console.warn(`🚫 API Key ${exhaustedIndex + 1} marked as exhausted`);
}

/**
 * Get stats about API key usage
 */
export function getKeyStats(): { total: number; available: number; exhausted: number } {
    return {
        total: API_KEYS.length,
        available: API_KEYS.length - exhaustedKeys.size,
        exhausted: exhaustedKeys.size,
    };
}
