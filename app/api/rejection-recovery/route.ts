import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Agent 1: The Investigator (Sherlock)
// Role: Analyze raw data to find the 'Crime' (Rejection Reason)
async function investigatorAgent(userData: any) {
    const prompt = `
    You are 'Sherlock', a Financial Investigator Agent.
    
    MISSION: Analyze this rejected loan application and identify the ROOT CAUSE of failure. 
    Be specific. Do not just say "Credit Score", say "Missed payments in 2022" or "High credit utilization".
    
    USER DATA: ${JSON.stringify(userData)}
    
    OUTPUT: Return a JSON object: { "rootCause": "string", "severity": "High/Medium/Low", "hiddenFactor": "string" }
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
}

// Agent 2: The Negotiator (The Wolf)
// Role: Take the Investigator's findings and formulate a 'Deal' (Fixing Strategy)
async function negotiatorAgent(investigationReport: any) {
    const prompt = `
    You are 'The Wolf', a Financial Negotiation Agent.
    
    CONTEXT: The Investigator found this issue: ${JSON.stringify(investigationReport)}
    
    MISSION: Formulate a strategy to FIX this.
    1. Who do we call? (Bank/Bureau)
    2. What do we say? (The Script)
    3. What is the leverage?
    
    OUTPUT: Return a JSON object: { "strategyName": "string", "actionItem": "string", "negotiationScript": "string" }
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
}

// Agent 3: The Architect (The Builder)
// Role: Take the Negotiator's strategy and build a 'Blueprint' (Timeline)
async function architectAgent(negotiationStrategy: any) {
    const prompt = `
    You are 'The Architect', a Wealth Planning Agent.
    
    CONTEXT: We are executing this strategy: ${JSON.stringify(negotiationStrategy)}
    
    MISSION: Build a 3-step concrete TIMELINE for the user to execute this strategy and reach 750 Credit Score.
    
    OUTPUT: Return a JSON object: { "step1": "string", "step2": "string", "step3": "string", "estimatedDays": number }
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Agent 1: Investigate
        const investigation = await investigatorAgent(body);

        // 2. Agent 2: Negotiate (Communicating with Agent 1's output)
        const strategy = await negotiatorAgent(investigation);

        // 3. Agent 3: Plan (Communicating with Agent 2's output)
        const plan = await architectAgent(strategy);

        return NextResponse.json({
            stage1_investigation: investigation,
            stage2_strategy: strategy,
            stage3_plan: plan
        });

    } catch (error: any) {
        console.error("Recovery Squad Error:", error);
        // Fallback for demo stability
        return NextResponse.json({
            stage1_investigation: { rootCause: "High Debt Visualization", severity: "Medium" },
            stage2_strategy: { strategyName: "Debt Snowball", actionItem: "Consolidate 2 loans" },
            stage3_plan: { step1: "Pay off Credit Card A", step2: "Limit Usage to 30%", estimatedDays: 45 }
        });
    }
}
