import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { employmentType, loanType, loanAmount } = await req.json()

    const prompt = `You are an expert in Indian loan documentation requirements. Based on the applicant's profile, list all required documents.

Profile:
- Employment Type: ${employmentType}
- Loan Type: ${loanType}
- Loan Amount: ₹${loanAmount}

Provide:
1. Categorized list of required documents (Identity, Address, Income, Employment, etc.)
2. Purpose/reason for each document category
3. 3-5 practical tips for document preparation
4. Common mistakes applicants make with documentation

Consider Indian-specific documents: Aadhaar, PAN, Form 16, ITR, bank statements, salary slips, etc.

Return ONLY valid JSON in this exact format:
{
  "requiredDocuments": [
    {
      "category": "string",
      "documents": ["string", "string"],
      "purpose": "string"
    }
  ],
  "tips": ["string", "string", "string"],
  "commonMistakes": ["string", "string"]
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    })

    const text = response.text
    if (!text) {
      throw new Error("Empty response from AI")
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from response")
    }
    const parsed = JSON.parse(jsonMatch[0])

    return Response.json(parsed)
  } catch (error: any) {
    console.error("[v0] Document analyzer API error:", error)

    if (error?.message?.includes("quota") || error?.message?.includes("429")) {
      return Response.json({ error: "API quota exceeded. Please try again in a few moments." }, { status: 429 })
    }

    return Response.json({ error: "Failed to analyze documents. Please try again later." }, { status: 500 })
  }
}
