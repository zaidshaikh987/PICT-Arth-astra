import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * Financial Council - Fallback Implementation
 * Uses direct Gemini API when ADK fails on serverless
 */

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

async function runSimpleAgent(role: "optimist" | "pessimist" | "judge", context: string): Promise<string> {
    const prompts = {
        optimist: `You are 'The Optimist' loan officer. Find every reason to APPROVE this loan. Focus on potential, growth, and character. Give a punchy 2-3 sentence argument.

LOAN APPLICATION:
${context}

Your argument FOR approval:`,

        pessimist: `You are 'The Pessimist' risk officer. Find every reason to REJECT this loan. Focus on risk, volatility, and worst-case scenarios. Give a harsh 2-3 sentence argument.

LOAN APPLICATION:
${context}

Your argument AGAINST approval:`,

        judge: `You are the Chief Compliance Officer. Based on the arguments below, make a FINAL binding decision.

${context}

Return ONLY JSON: {"verdict": "your explanation", "approved": true/false, "confidence": 0-100}`
    };

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ role: "user", parts: [{ text: prompts[role] }] }],
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return text.trim();
    } catch (error: any) {
        console.error(`${role} error:`, error.message);
        return `${role} is unavailable: ${error.message}`;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const context = JSON.stringify(body, null, 2);

        console.log("\n🏛️ Financial Council (Fallback Mode)...\n");

        // Run optimist
        console.log("  ⚡ Optimist arguing...");
        const optimistArg = await runSimpleAgent("optimist", context);

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));

        // Run pessimist
        console.log("  🔒 Pessimist arguing...");
        const pessimistArg = await runSimpleAgent("pessimist", context);

        // Small delay
        await new Promise(r => setTimeout(r, 1000));

        // Run judge
        console.log("  ⚖️ Judge deciding...");
        const judgeContext = `
LOAN APPLICATION:
${context}

OPTIMIST ARGUMENT:
${optimistArg}

PESSIMIST ARGUMENT:
${pessimistArg}
`;
        const judgeResponse = await runSimpleAgent("judge", judgeContext);

        // Parse judge response
        let judgment: any = { verdict: judgeResponse, approved: false, confidence: 50 };
        try {
            const jsonMatch = judgeResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                judgment = JSON.parse(jsonMatch[0]);
            }
        } catch {
            // Keep default
        }

        console.log("  ✅ Council Complete\n");

        return NextResponse.json({
            optimistArgument: optimistArg || "No argument provided.",
            pessimistArgument: pessimistArg || "No argument provided.",
            judgeVerdict: judgment.verdict || "No verdict.",
            approved: judgment.approved ?? false,
            confidence: judgment.confidence ?? 50,
            _metadata: { mode: "fallback-genai" }
        });

    } catch (error: any) {
        console.error("Council Error:", error);
        return NextResponse.json({
            optimistArgument: "Service temporarily unavailable.",
            pessimistArgument: "Service temporarily unavailable.",
            judgeVerdict: `Error: ${error.message}`,
            approved: false
        }, { status: 500 });
    }
}
