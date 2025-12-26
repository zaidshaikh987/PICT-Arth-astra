/**
 * Real Google ADK Implementation - Financial Council
 * 
 * LEVEL 1: Agent Configuration ✅
 * LEVEL 2: Agent Execution ✅
 * LEVEL 3: Pure Reasoning (No tools) ✅
 * LEVEL 4: Memory & Planning ✅
 */

import { LlmAgent, Runner, InMemorySessionService, Gemini } from "@google/adk";

// ===============================================
// LEVEL 4: SESSION MEMORY SERVICE
// ===============================================
const sessionService = new InMemorySessionService();

// Shared Model Configuration
const geminiModel = new Gemini({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ===============================================
// LEVEL 1: ADK DEBATE AGENTS
// ===============================================

export const optimistAgent = new LlmAgent({
    name: "optimist",
    description: "Sales-driven loan officer that argues for approval",
    model: geminiModel,
    instruction: `You are 'The Optimist'.
Find every reason to APPROVE this loan application.
Focus on potential, growth, and character.
Output a punchy 2-3 sentence argument.`,
});

export const pessimistAgent = new LlmAgent({
    name: "pessimist",
    description: "Risk underwriter that argues against approval",
    model: geminiModel,
    instruction: `You are 'The Pessimist'.
Find every reason to REJECT this loan application.
Focus on risk, volatility, and worst-case scenarios.
Output a harsh 2-3 sentence argument.`,
});

export const judgeAgent = new LlmAgent({
    name: "judge",
    description: "Impartial compliance officer that makes final decisions",
    model: geminiModel,
    instruction: `You are the Chief Compliance Officer. Make a BINDING decision.

Consider:
1. Optimist's arguments
2. Pessimist's concerns
3. Regulatory compliance

IMPORTANT: Return ONLY JSON. Do not add markdown or conversational text.

OUTPUT FORMAT:
{"verdict": "explanation", "approved": boolean, "confidence": 0-100}`,
});

// ===============================================
// LEVEL 2: AGENT EXECUTION
// ===============================================

// Helper to run an agent
async function runAgent(agent: LlmAgent, input: string, sessionId: string, sessionService: InMemorySessionService): Promise<string> {
    const runner = new Runner({
        agent,
        appName: "arthastra-council",
        sessionService,
    });

    const events = runner.runAsync({
        userId: "council-user",
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

export async function runADKFinancialCouncil(userData: any) {
    console.log("\n🏛️ ADK FINANCIAL COUNCIL: Multi-Agent Debate Execution");
    console.log("━".repeat(50));

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const context = JSON.stringify(userData, null, 2);
    const sessionId = `council-${Date.now()}`;

    // 1. Sequential Debate (for rate limits)
    console.log("\n⚔️ Debate Phase (Sequential)...");

    // Optimist
    const optSession = `${sessionId}-opt`;
    await sessionService.createSession({ appName: "arthastra-council", userId: "council-user", sessionId: optSession });

    const optimistArg = await runAgent(
        optimistAgent,
        `Argue FOR this loan:\n${context}`,
        optSession,
        sessionService
    );
    console.log("   ✓ Optimist Argument Received");

    // Rate Limit Buffer
    console.log("   ...waiting 20s to avoid rate limits...");
    await delay(20000);

    // Pessimist
    const pesSession = `${sessionId}-pes`;
    await sessionService.createSession({ appName: "arthastra-council", userId: "council-user", sessionId: pesSession });

    const pessimistArg = await runAgent(
        pessimistAgent,
        `Argue AGAINST this loan:\n${context}`,
        pesSession,
        sessionService
    );
    console.log("   ✓ Pessimist Argument Received");

    // Rate Limit Buffer
    console.log("   ...waiting 20s to avoid rate limits...");
    await delay(20000);

    // 2. Sequential Judgment
    console.log("\n⚖️ Judgment Phase...");
    const judgeInput = `
LOAN APPLICATION:
${context}

OPTIMIST ARGUMENT:
${optimistArg}

PESSIMIST ARGUMENT:
${pessimistArg}

Make your final, binding decision.`;

    const judgeSession = `${sessionId}-judge`;
    await sessionService.createSession({ appName: "arthastra-council", userId: "council-user", sessionId: judgeSession });

    const judgeVerdict = await runAgent(judgeAgent, judgeInput, judgeSession, sessionService);
    console.log("   ✓ Verdict Delivered");

    console.log("\n✅ ADK Council Adjourned\n");

    // Parse Judge JSON
    let judgment: any;
    try {
        const jsonMatch = judgeVerdict.match(/\{[\s\S]*\}/);
        judgment = jsonMatch ? JSON.parse(jsonMatch[0]) : { verdict: judgeVerdict, approved: false };
    } catch {
        judgment = { verdict: judgeVerdict, approved: false };
    }

    return {
        sessionId,
        optimist: optimistArg,
        pessimist: pessimistArg,
        judgment,
    };
}
