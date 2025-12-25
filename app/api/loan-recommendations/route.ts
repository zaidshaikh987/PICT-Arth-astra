import { LoanOfficerAgent } from "@/lib/agents/specialists/loan-officer"

export async function POST(req: Request) {
  try {
    const userData = await req.json()
    const agent = new LoanOfficerAgent()

    const result = await agent.recommendLoans(userData)

    if (!result.success) {
      throw new Error(result.error)
    }

    return Response.json(result.data)
  } catch (error: any) {
    console.error("[Agent] Loan recommendations error:", error)

    if (error?.message?.includes("quota") || error?.message?.includes("429")) {
      return Response.json({ error: "API quota exceeded. Please try again in a few moments." }, { status: 429 })
    }

    return Response.json({ error: error.message || "Failed to generate recommendations." }, { status: 500 })
  }
}
