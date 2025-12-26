/**
 * Real Google ADK Implementation - Recovery Squad
 * 
 * LEVEL 1: Agent Configuration ✅
 * LEVEL 2: Agent Execution ✅
 * LEVEL 3: Tool Calling (with Zod schemas) ✅
 * LEVEL 4: Memory & Planning ✅
 */

import { LlmAgent, InMemorySessionService, FunctionTool, Runner, Gemini } from "@google/adk";
import { z } from "zod";
import {
    calculateDTI,
    analyzeEmploymentRisk,
    detectFinancialAnomalies,
    simulateCreditScoreImpact,
    calculateSavingsTimeline,
} from "../tools/agent-tools";

// ===============================================
// LEVEL 4: SESSION MEMORY SERVICE
// ===============================================
const sessionService = new InMemorySessionService();

// Shared Model Configuration with Explicit API Key
const geminiModel = new Gemini({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ===============================================
// LEVEL 3: ADK FUNCTION TOOLS
// Thin adapters around existing business logic
// ===============================================

// 1. DTI Tool
const dtiSchema = z.object({
    monthlyIncome: z.number().describe("Monthly income in INR"),
    existingEMI: z.number().describe("Total existing EMI obligations"),
    monthlyExpenses: z.number().describe("Monthly living expenses"),
});

const dtiTool = new FunctionTool<typeof dtiSchema>({
    name: "calculateDTI",
    description: "Calculate Debt-to-Income ratio (DTI)",
    parameters: dtiSchema,
    execute: async (args: z.infer<typeof dtiSchema>) => {
        const dti = calculateDTI(args.monthlyIncome, args.existingEMI, args.monthlyExpenses);
        return { dti, assessment: dti < 40 ? "SAFE" : "RISKY" };
    },
});

// 2. Employment Risk Tool
const employmentRiskSchema = z.object({
    employmentType: z.enum(["salaried", "self_employed", "freelancer", "student"]),
    tenure: z.enum(["<6_months", "6m-1yr", "1-2yr", "2-5yr", "5+yr"]),
});

const employmentRiskTool = new FunctionTool<typeof employmentRiskSchema>({
    name: "analyzeEmploymentRisk",
    description: "Analyze employment stability risk",
    parameters: employmentRiskSchema,
    execute: async (args: z.infer<typeof employmentRiskSchema>) => {
        return analyzeEmploymentRisk(args.employmentType, args.tenure);
    },
});

// 3. Anomaly Tool
const anomalySchema = z.object({
    monthlyIncome: z.number(),
    monthlyExpenses: z.number().optional(),
    existingEMI: z.number().optional(),
    savings: z.string().optional(),
    employmentType: z.string().optional(),
});

const anomalyTool = new FunctionTool<typeof anomalySchema>({
    name: "detectFinancialAnomalies",
    description: "Detect financial inconsistencies or red flags",
    parameters: anomalySchema,
    execute: async (args: z.infer<typeof anomalySchema>) => {
        return detectFinancialAnomalies(args);
    },
});

// 4. Credit Simulator Tool
const creditSimSchema = z.object({
    currentScore: z.number(),
    actions: z.array(z.string()).describe("Actions: pay_off_debt, reduce_utilization, dispute_error"),
});

const creditSimTool = new FunctionTool<typeof creditSimSchema>({
    name: "simulateCreditScore",
    description: "Simulate impact of actions on credit score",
    parameters: creditSimSchema,
    execute: async (args: z.infer<typeof creditSimSchema>) => {
        return simulateCreditScoreImpact(args.currentScore, args.actions);
    },
});

// 5. Savings Timeline Tool
const savingsSchema = z.object({
    currentSavings: z.union([z.number(), z.string()]).describe("Current savings (e.g. 50000 or '50k')"),
    targetSavings: z.number(),
    monthlySavingsRate: z.union([z.number(), z.string()]),
});

const savingsTool = new FunctionTool<typeof savingsSchema>({
    name: "calculateSavingsTimeline",
    description: "Calculate savings timeline and milestones",
    parameters: savingsSchema,
    execute: async (args: z.infer<typeof savingsSchema>) => {
        const parseNum = (val: string | number) => {
            if (typeof val === 'number') return val;
            return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
        };
        const current = parseNum(args.currentSavings);
        const rate = parseNum(args.monthlySavingsRate);
        return calculateSavingsTimeline(current, args.targetSavings, rate);
    },
});

// Helper to run an agent and get text response
async function runAgent(agent: LlmAgent, input: string, sessionId: string, sessionService: InMemorySessionService): Promise<string> {
    const runner = new Runner({
        agent,
        appName: "arthastra-recovery",
        sessionService,
    });

    const events = runner.runAsync({
        userId: "user-1", // Fixed user for demo
        sessionId,
        newMessage: {
            role: "user",
            parts: [{ text: input }],
        },
    });

    let responseText = "";
    for await (const event of events) {
        if (event.content?.parts?.[0]?.text) {
            responseText += event.content.parts[0].text;
        } else {
            console.log("DEBUG EVENT:", JSON.stringify(event, null, 2));
        }
    }
    return responseText;
}

// ===============================================
// LEVEL 1: ADK AGENTS
// ===============================================

export const investigatorAgent = new LlmAgent({
    name: "investigator",
    description: "Financial investigator that analyzes loan applications for risks",
    model: geminiModel,
    instruction: `You are a Financial Investigator. Analyze loan applications using available tools.

IMPORTANT:
1. Always call calculateDTI first.
2. Always call analyzeEmploymentRisk next.
3. Call detectFinancialAnomalies if needed.

OUTPUT FORMAT:
Return PURE JSON in this specific format (no markdown, no extra text):
{
  "rootCause": "Primary reason for rejection",
  "hiddenFactor": "Any subtle risk factors",
  "severity": "High/Medium/Low",
  "bulletPoints": ["Key finding 1", "Key finding 2", "Key finding 3"]
}`,
    tools: [dtiTool, employmentRiskTool, anomalyTool],
});

export const negotiatorAgent = new LlmAgent({
    name: "negotiator",
    description: "Credit recovery specialist that creates improvement strategies",
    model: geminiModel,
    instruction: `You are a Credit Recovery Strategist.
Use simulateCreditScore to model improvements.

OUTPUT FORMAT:
Return PURE JSON in this specific format (no markdown):
{
  "strategyName": "Name of the strategy",
  "actionItem": "Main action to take",
  "bulletPoints": ["Specific step 1", "Specific step 2", "Specific step 3"],
  "negotiationScript": "Professional script for bank negotiation (max 3 sentences)"
}`,
    tools: [creditSimTool],
});

export const architectAgent = new LlmAgent({
    name: "architect",
    description: "Wealth planning architect that builds recovery timelines",
    model: geminiModel,
    instruction: `You are a Wealth Planning Architect.
Use calculateSavingsTimeline to build realistic milestones.

IMPORTANT: 
- Do NOT ask for more information. Make reasonable assumptions if data is missing.
- Return ONLY JSON. No markdown, no conversational text.

OUTPUT FORMAT:
{
  "step1": "Immediate action (Week 1)",
  "step2": "Short-term goal (Month 1)",
  "step3": "Long-term target (Month 3-6)",
  "estimatedDays": 180
}`,
    tools: [savingsTool],
});

// ===============================================
// LEVEL 2: AGENT EXECUTION
// ===============================================

export async function runADKRecoverySquad(userData: any) {
    console.log("\n🚀 ADK RECOVERY SQUAD: Full Pipeline Execution");
    console.log("━".repeat(50));

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const context = JSON.stringify(userData, null, 2);
    const sessionId = `session-${Date.now()}`;

    // 0. Initialize Creation
    console.log("DEBUG: API Key Present?", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    // 1. Investigator
    console.log("\n🕵️ Investigator: Analyzing...");
    const session1 = `${sessionId}-step1`;
    await sessionService.createSession({ appName: "arthastra-recovery", userId: "user-1", sessionId: session1 });

    const investigation = await runAgent(
        investigatorAgent,
        `Analyze this loan application:\n${context}`,
        session1,
        sessionService
    );
    console.log("   ✓ Analysis Complete");

    // Rate Limit Buffer
    console.log("   ...waiting 20s to avoid rate limits (5 RPM quota)...");
    await delay(20000);

    // 2. Negotiator
    console.log("\n🐺 Negotiator: Strategizing...");
    const session2 = `${sessionId}-step2`;
    await sessionService.createSession({ appName: "arthastra-recovery", userId: "user-1", sessionId: session2 });

    const strategy = await runAgent(
        negotiatorAgent,
        `Create recovery strategy based on this investigation:\n${investigation}`,
        session2,
        sessionService
    );
    console.log("   ✓ Strategy Formulated");

    // Rate Limit Buffer
    console.log("   ...waiting 20s to avoid rate limits (5 RPM quota)...");
    await delay(20000);

    // 3. Architect
    console.log("\n🏗️ Architect: Planning...");
    const session3 = `${sessionId}-step3`;
    await sessionService.createSession({ appName: "arthastra-recovery", userId: "user-1", sessionId: session3 });

    const roadmap = await runAgent(
        architectAgent,
        `Build recovery roadmap based on this strategy:\n${strategy}`,
        session3,
        sessionService
    );
    console.log("   ✓ Roadmap Built");

    console.log("\n✅ ADK Pipeline Complete\n");

    return {
        sessionId,
        investigation,
        strategy,
        roadmap,
    };
}
