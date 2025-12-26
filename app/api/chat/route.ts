import { GoogleGenAI } from "@google/genai"
import { OrchestratorAgent } from "@/lib/agents/core/orchestrator"

export const maxDuration = 30

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const AGENT_PERSONAS = {
  ONBOARDING: `You are the Onboarding Assistant. Your goal is to welcome the user and help them complete their profile. Be warm, encouraging, and ask one question at a time.`,

  LOAN_OFFICER: `You are the Senior Loan Officer & Eligibility Analyst. You specialize in analyzing loan eligibility, bank policies, interest rates, and calculating EMIs.`,

  RECOVERY: `You are the Credit Rehabilitation Specialist. 
  1. Start by identifying yourself.
  2. If the user's Credit Score is known (from analysis), acknowledge it (e.g., "I see your score is 810").
  3. If you don't know the specific rejection reason (e.g. "Low DTI", "Policy"), ask for it to tailor the plan.
  4. Be empathetic but very proactive.`,

  GENERAL: `You are ArthAstra, a helpful financial guide. Answer general queries politely.`
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

    console.log(`[Chat] Routed to: ${selectedAgent}`)

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
    } else if (selectedAgent === "RECOVERY") {
      const { RecoveryAgent } = await import("@/lib/agents/specialists/recovery-agent")
      const agent = new RecoveryAgent()
      const result = await agent.generateRecoveryPlan(context || {})
      if (result.success) {
        agentContext = `REAL-TIME AGENT ANALYSIS (CIBIL & RECOVERY PLAN):\n${JSON.stringify(result.data)}\nUse this data to answer accurately.`
      }
    }

    // RAG: Semantic search for relevant knowledge
    let ragContext = "";
    try {
      const { vectorStore } = await import("@/lib/ai/vector-store");
      const relevantKnowledge = await vectorStore.getContext(lastMessage.content);
      if (relevantKnowledge) {
        ragContext = `\nKNOWLEDGE BASE (Use this to answer questions about ArthAstra features):\n${relevantKnowledge}`;
      }
    } catch (error) {
      console.log("RAG not available:", error);
    }

    const systemPrompt = `${specificPersona}
    
    LANGUAGE PREFERENCE: ${language === "hi" ? "Respond in Hindi (Devanagari script)." : "Respond in English."}

    CONTEXT AWARENESS:
    ${context ? `User Profile: ${JSON.stringify(context)}` : "No user profile available yet."}

    ${agentContext}

    ${ragContext}
    
    RESPONSE GUIDELINES:
    1. Stay in character as the "${selectedAgent}" agent.
    2. Keep responses concise (max 3 paragraphs).
    3. Use Indian financial context (₹, Lakhs, Crores).
    4. If AGENT ANALYSIS is provided, YOU MUST USE IT. Do not ask for data provided in the analysis.
    5. If KNOWLEDGE BASE info is provided, use it to give accurate answers about ArthAstra features.
    `

    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...conversationHistory,
        { role: "user", parts: [{ text: lastMessage.content }] },
      ],
    })

    const text = response.text

    return new Response(JSON.stringify({ response: text, agent: selectedAgent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: error?.message || "Failed to get response. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
