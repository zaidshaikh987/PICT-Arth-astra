import { NextResponse } from "next/server";
import { runADKFinancialCouncil } from "@/lib/agents/adk-council";

/**
 * Financial Council API — Real Google ADK Multi-Agent Debate
 * 
 * Uses the full ADK implementation with 3 debate agents:
 * 1. Optimist - Argues FOR approval
 * 2. Pessimist - Argues AGAINST approval
 * 3. Judge - Makes final binding decision
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("\n");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║   🏛️ FINANCIAL COUNCIL - ADK Multi-Agent Debate            ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║  Agent 1: ⚡ Optimist (Argues FOR approval)               ║");
        console.log("║  Agent 2: 🔒 Pessimist (Argues AGAINST approval)         ║");
        console.log("║  Agent 3: ⚖️ Judge (Makes final decision)                ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("\n📋 INPUT DATA:");
        console.log(`   • Income: ₹${(body.monthlyIncome || 30000).toLocaleString()}`);
        console.log(`   • Loan Amount: ₹${(body.loanAmount || 500000).toLocaleString()}`);
        console.log(`   • Credit Score: ${body.creditScore || 650}`);
        console.log(`   • Employment: ${body.employmentType || "salaried"}`);
        console.log("");

        const userData = {
            monthlyIncome: Number(body.monthlyIncome) || 30000,
            existingEMI: Number(body.existingEMI) || 0,
            monthlyExpenses: Number(body.monthlyExpenses) || Math.round(Number(body.monthlyIncome || 30000) * 0.3),
            creditScore: Number(body.creditScore) || 650,
            employmentType: body.employmentType || "salaried",
            employmentTenure: body.employmentTenure || "1-2yr",
            loanAmount: Number(body.loanAmount) || 500000,
            tenure: Number(body.tenure) || 3,
        };

        // Run the full ADK council debate with 3 agents
        const result = await runADKFinancialCouncil(userData);

        // Parse judgment JSON
        let judgment = { verdict: "Decision pending", approved: false, confidence: 50 };
        try {
            if (result.judgment && typeof result.judgment === 'object') {
                judgment = result.judgment;
            } else {
                const jsonMatch = result.judgment?.match(/\{[\s\S]*\}/);
                if (jsonMatch) judgment = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn("Failed to parse judgment JSON:", e);
            // Try to extract from raw response
            judgment.verdict = result.judgment?.substring(0, 200) || "Analysis complete";
        }

        console.log("\n╔════════════════════════════════════════════════════════════╗");
        console.log("║                    📜 FINAL VERDICT                        ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log(`║  Optimist:   ${(result.optimist || "").substring(0, 35).replace(/\n/g, " ")}... ║`);
        console.log(`║  Pessimist: ${(result.pessimist || "").substring(0, 35).replace(/\n/g, " ")}... ║`);
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log(`║  Decision: ${judgment.approved ? "✅ APPROVED" : "❌ REJECTED"}                                        ║`);
        console.log(`║  Confidence: ${judgment.confidence || 50}%                                        ║`);
        console.log(`║  Verdict: ${(judgment.verdict || "").substring(0, 35)}... ║`);
        console.log("╚════════════════════════════════════════════════════════════╝\n");

        return NextResponse.json({
            optimistArgument: result.optimist || "No argument provided.",
            pessimistArgument: result.pessimist || "No argument provided.",
            judgeVerdict: judgment.verdict || "No verdict.",
            approved: judgment.approved ?? false,
            confidence: judgment.confidence ?? 50,
            _metadata: {
                mode: "adk-multi-agent",
                agents: ["optimist", "pessimist", "judge"],
                apiCalls: 3,
                sessionId: result.sessionId,
            },
        });

    } catch (error: any) {
        console.error("Council Error:", error);
        return NextResponse.json({
            optimistArgument: "Service temporarily unavailable.",
            pessimistArgument: "Service temporarily unavailable.",
            judgeVerdict: `Error: ${error.message}. Please check API key configuration.`,
            approved: false,
        }, { status: 500 });
    }
}
