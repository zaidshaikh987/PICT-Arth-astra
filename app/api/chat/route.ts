import { getGeminiClient } from "@/lib/ai/gemini-client"
import { OrchestratorAgent } from "@/lib/agents/core/orchestrator"

export const maxDuration = 60

const AGENT_PERSONAS = {
  ONBOARDING: `You are the Onboarding Assistant for ArthAstra. Welcome the user and help them complete their financial profile. Be warm, encouraging, and ask one question at a time.`,

  LOAN_OFFICER: `You are the Senior Loan Officer & Eligibility Analyst at ArthAstra. You specialize in analyzing loan eligibility, bank policies, interest rates, RBI guidelines, and calculating EMIs. Always use Indian context (₹, Lakhs, Crores, CIBIL score).`,

  RECOVERY: `You are the Credit Rehabilitation Specialist at ArthAstra.
  1. Start by identifying yourself.
  2. If the user's Credit Score is known (from analysis), acknowledge it (e.g., "I see your score is 680").
  3. If you don't know the specific rejection reason, ask for it to tailor the plan.
  4. Be empathetic but very proactive with actionable advice.`,

  GENERAL: `You are ArthAstra, an intelligent financial guide for Indian borrowers. Answer questions about loans, CIBIL scores, EMI, eligibility, and financial planning. Be concise and helpful.`
}

export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const context = lastMessage.context

    // 1. Run Orchestrator to decide intent
    const orchestrator = new OrchestratorAgent()
    const routingResult = await orchestrator.routeRequest(lastMessage.content, messages.slice(0, -1))

    const selectedAgent = routingResult.data?.selectedAgent || "GENERAL"
    const specificPersona = AGENT_PERSONAS[selectedAgent as keyof typeof AGENT_PERSONAS] || AGENT_PERSONAS.GENERAL

    console.log(`[Chat] 🤖 Routed to: ${selectedAgent} | Gemini 2.5 Flash`)

    // 2. Execute Specialist Agent if applicable
    let agentContext = ""

    if (selectedAgent === "LOAN_OFFICER") {
      const { LoanOfficerAgent } = await import("@/lib/agents/specialists/loan-officer")
      const agent = new LoanOfficerAgent()
      const result = await agent.recommendLoans(context || {})
      if (result.success) {
        agentContext = `REAL-TIME AGENT ANALYSIS:\n${JSON.stringify(result.data)}\nUse this data to answer accurately.`
      }
    } else if (selectedAgent === "RECOVERY") {
      const { RecoveryAgent } = await import("@/lib/agents/specialists/recovery-agent")
      const agent = new RecoveryAgent()
      const result = await agent.generateRecoveryPlan(context || {})
      if (result.success) {
        agentContext = `REAL-TIME AGENT ANALYSIS (CIBIL & RECOVERY PLAN):\n${JSON.stringify(result.data)}\nUse this data to answer accurately.`
      }
    }

    // 3. RAG: Semantic search for relevant knowledge
    let ragContext = ""
    try {
      const { vectorStore } = await import("@/lib/ai/vector-store")
      const relevantKnowledge = await vectorStore.getContext(lastMessage.content)
      if (relevantKnowledge) {
        ragContext = `\nKNOWLEDGE BASE (Use this to answer questions about ArthAstra features):\n${relevantKnowledge}`
      }
    } catch (error) {
      console.log("[Chat] RAG not available:", error)
    }

    const systemPrompt = `${specificPersona}
    
    LANGUAGE PREFERENCE: ${language === "hi" ? "Respond in Hindi (Devanagari script). Use simple, clear Hindi." : "Respond in English."}

    CONTEXT AWARENESS:
    ${context ? `User Profile: ${JSON.stringify(context)}` : "No user profile available yet."}

    ${agentContext}

    ${ragContext}
    
    RESPONSE GUIDELINES:
    1. Stay in character as the "${selectedAgent}" agent.
    2. BE VERY BRIEF — max 2 short sentences OR max 4 bullet points. Never write paragraphs.
    3. Use Indian financial context (₹, Lakhs, Crores, CIBIL, RBI).
    4. If AGENT ANALYSIS is provided, use it directly. Do NOT ask for data already in the analysis.
    5. If KNOWLEDGE BASE info is provided, use it accurately.
    6. No greetings or preamble — get straight to the answer.
    7. Use bold for key numbers or terms. Use bullets for lists.
    `

    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Use shared Gemini client with key rotation support
    const gemini = getGeminiClient()
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...conversationHistory,
        { role: "user", parts: [{ text: lastMessage.content }] },
      ],
    })

    const text = response.text
    console.log(`[Chat] ✅ Gemini response received (${text?.length || 0} chars)`)

    return new Response(JSON.stringify({ response: text, agent: selectedAgent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[Chat] ❌ Gemini API error:", error)

    // Check for quota error
    const isQuota = error?.message?.includes("429") || error?.message?.includes("quota")
    const errMsg = isQuota
      ? "Gemini API quota exceeded. Please wait a moment and try again."
      : error?.message || "Failed to get response from Gemini. Please try again."

    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: isQuota ? 429 : 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
