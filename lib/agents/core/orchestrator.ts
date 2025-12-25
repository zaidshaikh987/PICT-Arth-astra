import { BaseAgent } from "./base-agent"
import { AgentResponse } from "./types"
import { LOAN_OFFICER_PROMPTS } from "../prompts"

export class OrchestratorAgent extends BaseAgent {
    constructor() {
        super("Orchestrator", "Routing and Intent Classification")
    }

    async process(input: any): Promise<AgentResponse> {
        return this.routeRequest(input.text, input.history)
    }

    async routeRequest(userInput: string, history: any[]): Promise<AgentResponse> {
        const lowerInput = userInput.toLowerCase()

        // 1. FAST PATH: Keyword Matching (Guaranteed routing)
        if (lowerInput.includes("reject") || lowerInput.includes("decline") || lowerInput.includes("score") || lowerInput.includes("cibil")) {
            return { success: true, data: { selectedAgent: "RECOVERY", reason: "Keyword match" } }
        }
        if (lowerInput.includes("loan") || lowerInput.includes("emi") || lowerInput.includes("rate") || lowerInput.includes("bank") || lowerInput.includes("eligib") || lowerInput.includes("qualify")) {
            return { success: true, data: { selectedAgent: "LOAN_OFFICER", reason: "Keyword match" } }
        }
        if (lowerInput.includes("name") || lowerInput.includes("hello") || lowerInput.includes("hi")) {
            return { success: true, data: { selectedAgent: "ONBOARDING", reason: "Keyword match" } }
        }

        try {
            // Summarize history for context (last 2 messages)
            const context = history.slice(-2).map(m => `${m.role}: ${m.content}`).join("\n")

            const prompt = LOAN_OFFICER_PROMPTS.ORCHESTRATOR
                .replace("{{userInput}}", userInput)
                .replace("{{history}}", context || "No history")

            const responseText = await this.generate(prompt, { temperature: 0.1 }) // Low temp for routing
            const data = this.parseJson(responseText)

            return { success: true, data }
        } catch (error: any) {
            // Fallback to GENERAL if routing fails
            return {
                success: true,
                data: { selectedAgent: "GENERAL", reason: "Routing failed", refinedInput: userInput }
            }
        }
    }
}
