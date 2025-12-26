import { GoogleGenAI } from "@google/genai"
import { Agent, AgentResponse } from "./types"

export abstract class BaseAgent implements Agent {
    protected ai: GoogleGenAI
    protected model: any // Using any to avoid strict typing issues with the experimental SDK for now
    public name: string
    public role: string

    constructor(name: string, role: string) {
        this.name = name
        this.role = role
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY. Please add it to .env.local")
        }
        this.ai = new GoogleGenAI({ apiKey })
        // Initialize default model
        this.model = this.ai.models
    }

    abstract process(input: any): Promise<AgentResponse>

    protected async generate(prompt: string, config?: any): Promise<string> {
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-exp"]

        for (const modelName of modelsToTry) {
            try {
                return await this.generateWithModel(modelName, prompt, config)
            } catch (error: any) {
                const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota")

                // If it's the last model or not a quota error, rethrow
                if (modelName === modelsToTry[modelsToTry.length - 1] || !isQuotaError) {
                    console.error(`[${this.name}] Final generation error:`, error)
                    throw error
                }

                console.warn(`[${this.name}] Quota exceeded for ${modelName}, falling back to next model...`)
                // Small delay before switching
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
        throw new Error("All models failed")
    }

    private async generateWithModel(modelName: string, prompt: string, config?: any): Promise<string> {
        const response = await this.model.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: config || {
                temperature: 0.7,
                maxOutputTokens: 2000,
            },
        })

        const text = response.text
        if (!text) {
            throw new Error("Empty response from AI")
        }
        return text
    }

    protected parseJson<T>(text: string): T {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error("Failed to parse JSON from response")
        }
        return JSON.parse(jsonMatch[0]) as T
    }
}
