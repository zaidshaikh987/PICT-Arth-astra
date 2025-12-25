import { RecoveryAgent } from "@/lib/agents/specialists/recovery-agent"

export async function POST(req: Request) {
    try {
        const userData = await req.json()
        const agent = new RecoveryAgent()

        const result = await agent.generateRecoveryPlan(userData)

        if (!result.success) {
            throw new Error(result.error)
        }

        return Response.json(result.data)
    } catch (error: any) {
        console.error("[Agent] Recovery plan error:", error)

        if (error?.message?.includes("quota") || error?.message?.includes("429")) {
            return Response.json({ error: "API quota exceeded. Using cached rules." }, { status: 429 })
        }

        return Response.json({ error: error.message || "Failed to generate plan." }, { status: 500 })
    }
}
