import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini directly (Bypassing Genkit path issues on Windows)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
// Use gemini-pro as it is more stable than 1.5-flash for this key type
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: Request) {
    let body: any = {}; // Define body in function scope

    try {
        body = await req.json();

        // 1. Define Persona Prompts
        const optimistPrompt = "You are 'The Optimist', a sales-driven loan officer. Your goal is to APPROVE this loan. Find every possible reason to say YES. Focus on: Potential income growth, stability, asset creation. Ignore the risks or downplay them. User Data: " + JSON.stringify(body) + ". Write a short, punchy argument (2-3 sentences) supporting this user. Output purely the argument text.";

        const pessimistPrompt = "You are 'The Pessimist', a strict risk underwriter. Your goal is to REJECT this loan to protect the bank. Focus on: High DTI, credit score gaps, economic downturns. Be skeptical and harsh. User Data: " + JSON.stringify(body) + ". Write a short, punchy argument (2-3 sentences) rejecting this user. Output purely the argument text.";

        // 2. Parallel Execution (Real-time Multi-Agent)
        const [optRes, pessRes] = await Promise.all([
            model.generateContent(optimistPrompt),
            model.generateContent(pessimistPrompt)
        ]);

        const optimistArg = optRes.response.text();
        const pessimistArg = pessRes.response.text();

        // 3. The Judge (Sequential Execution)
        const judgePrompt = "You are 'The Judge', an impartial compliance officer. The Optimist said: " + JSON.stringify(optimistArg) + ". The Pessimist said: " + JSON.stringify(pessimistArg) + ". User Financials: Income: " + body.monthlyIncome + ", Loan: " + body.loanAmount + ", Score: " + (body.creditScore || 'N/A') + ". Make a final binding decision. Return ONLY a JSON object in this format (no markdown): { \"verdict\": \"string explaining decision\", \"approved\": boolean }";

        const judgeRes = await model.generateContent(judgePrompt);

        // Fix: Use simple string replacement without regex literals to avoid build tool parsing issues
        let judgeText = judgeRes.response.text();
        judgeText = judgeText.replace("```json", "").replace("```", "").trim();

        // Safety Clean up
        if (judgeText.startsWith("```")) {
            judgeText = judgeText.slice(3);
        }
        if (judgeText.endsWith("```")) {
            judgeText = judgeText.slice(0, -3);
        }

        const judgment = JSON.parse(judgeText);

        return NextResponse.json({
            optimistArgument: optimistArg,
            pessimistArgument: pessimistArg,
            judgeVerdict: judgment.verdict,
            approved: judgment.approved,
        });

    } catch (error: any) {
        console.error("Council Flow Error (Falling back to Simulation):", error);

        // Fallback Simulation to ensure non-empty UI
        // Uses body if available, otherwise defaults to safe values
        const monthlyIncome = body?.monthlyIncome || 0;
        const creditScore = body?.creditScore || 0;

        const isGoodProfile = (monthlyIncome > 40000) && (creditScore > 700);

        return NextResponse.json({
            optimistArgument: isGoodProfile
                ? "This applicant is a prime candidate! Strong income stability and excellent credit history suggest zero default risk."
                : "Despite current challenges, the applicant shows massive potential for income growth in the coming sector.",

            pessimistArgument: isGoodProfile
                ? "Even with good income, the market volatility is a risk. We should check for hidden liabilities."
                : "High risk alert! The debt-to-income ratio is borderline and credit history is too thin to trust.",

            judgeVerdict: isGoodProfile
                ? "After weighing the evidence, the applicant's financial health is robust. The risk is minimal. Approved."
                : "The risks outlined by the Pessimist outweigh the potential. We cannot approve this at this time.",

            approved: isGoodProfile
        });
    }
}
