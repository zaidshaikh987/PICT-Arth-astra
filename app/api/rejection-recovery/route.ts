import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { calculateDTI, analyzeEmploymentRisk, simulateCreditScoreImpact } from "@/lib/tools/agent-tools";

/**
 * Recovery Squad - Fallback Implementation
 * Uses direct Gemini API when ADK fails on serverless
 */

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

async function runRecoveryAgent(role: "investigator" | "negotiator" | "architect", context: string): Promise<string> {
    const prompts = {
        investigator: `You are a Financial Investigator analyzing a rejected loan application.

APPLICANT DATA:
${context}

Analyze the application and identify:
1. The root cause of rejection
2. Any hidden risk factors
3. Severity level

Return ONLY JSON (no markdown):
{"rootCause": "primary reason", "hiddenFactor": "subtle risk", "severity": "High/Medium/Low", "bulletPoints": ["finding 1", "finding 2", "finding 3"]}`,

        negotiator: `You are a Credit Recovery Strategist.

INVESTIGATION FINDINGS:
${context}

Create a recovery strategy with:
1. A clear strategy name
2. Main action item
3. Specific steps
4. A negotiation script for the bank

Return ONLY JSON (no markdown):
{"strategyName": "name", "actionItem": "main action", "bulletPoints": ["step 1", "step 2", "step 3"], "negotiationScript": "professional script for bank"}`,

        architect: `You are a Wealth Planning Architect.

STRATEGY:
${context}

Build a concrete recovery timeline with:
1. Immediate action (Week 1)
2. Short-term goal (Month 1)
3. Long-term target (Month 3-6)

Return ONLY JSON (no markdown):
{"step1": "Week 1 action", "step2": "Month 1 goal", "step3": "Month 3-6 target", "estimatedDays": 180}`
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
        return "";
    }
}

function safeParse(text: string, fallback: any): any {
    try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : fallback;
    } catch {
        return fallback;
    }
}

export async function POST(req: Request) {
    let body: any = {};

    try {
        body = await req.json();
        const context = JSON.stringify(body, null, 2);

        console.log("\n🔧 Recovery Squad (Fallback Mode)...\n");

        // Calculate DTI using real tool
        const dti = calculateDTI(
            body.monthlyIncome || 100000,
            body.existingEMI || 20000,
            body.monthlyExpenses || 30000
        );

        // Enrich context with computed data
        const enrichedContext = `${context}\n\nCOMPUTED DATA:\n- DTI: ${dti}%`;

        // Stage 1: Investigator
        console.log("  🕵️ Investigator analyzing...");
        const investigationRaw = await runRecoveryAgent("investigator", enrichedContext);
        const investigation = safeParse(investigationRaw, {
            rootCause: `High DTI ratio (${dti}%)`,
            hiddenFactor: "Income volatility",
            severity: dti > 50 ? "High" : "Medium",
            bulletPoints: [`DTI: ${dti}%`, "Employment verification needed", "Savings below threshold"]
        });

        await new Promise(r => setTimeout(r, 1000));

        // Stage 2: Negotiator
        console.log("  🐺 Negotiator strategizing...");
        const strategyRaw = await runRecoveryAgent("negotiator", JSON.stringify(investigation));
        const strategy = safeParse(strategyRaw, {
            strategyName: "Debt Reduction Strategy",
            actionItem: "Pay down existing debt",
            bulletPoints: ["Clear smallest EMI first", "Request salary revision letter", "Build emergency fund"],
            negotiationScript: "I am actively working to improve my debt ratio and can provide updated financials."
        });

        await new Promise(r => setTimeout(r, 1000));

        // Stage 3: Architect
        console.log("  🏗️ Architect planning...");
        const planRaw = await runRecoveryAgent("architect", JSON.stringify(strategy));
        const plan = safeParse(planRaw, {
            step1: "Create budget tracker (Week 1)",
            step2: "Pay off ₹20k debt (Month 1)",
            step3: "Build ₹50k emergency fund (Month 3-6)",
            estimatedDays: 180
        });

        console.log("  ✅ Recovery Squad Complete\n");

        return NextResponse.json({
            stage1_investigation: investigation,
            stage2_strategy: strategy,
            stage3_plan: plan,
            _metadata: { mode: "fallback-genai", dti }
        });

    } catch (error: any) {
        console.error("Recovery Squad Error:", error);

        // Static fallback
        const dti = calculateDTI(
            body.monthlyIncome || 100000,
            body.existingEMI || 20000,
            body.monthlyExpenses || 30000
        );

        return NextResponse.json({
            stage1_investigation: {
                rootCause: "System overloaded",
                hiddenFactor: "Unable to process",
                severity: "Medium",
                bulletPoints: [`DTI: ${dti}%`, "Manual review required"]
            },
            stage2_strategy: {
                strategyName: "Documentation Recovery",
                actionItem: "Submit additional documents",
                bulletPoints: ["Bank statements", "Salary slips", "ID proof"],
                negotiationScript: "Please review my updated documents."
            },
            stage3_plan: {
                step1: "Gather documents (Week 1)",
                step2: "Submit to bank (Week 2)",
                step3: "Follow up (Month 1)",
                estimatedDays: 30
            }
        }, { status: 500 });
    }
}
