import { NextResponse } from "next/server";
import { runADKRecoverySquad } from "@/lib/agents/adk-recovery-squad";

/**
 * Rejection Recovery API — Real Google ADK Multi-Agent Pipeline
 * 
 * Uses the full ADK implementation with 3 specialized agents:
 * 1. Investigator - Analyzes root causes using ADK tools
 * 2. Negotiator - Creates recovery strategies using ADK tools
 * 3. Architect - Builds recovery roadmap using ADK tools
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const userData = {
            monthlyIncome: Number(body.monthlyIncome) || 30000,
            existingEMI: Number(body.existingEMI) || 0,
            monthlyExpenses: Number(body.monthlyExpenses) || Math.round(Number(body.monthlyIncome || 30000) * 0.3),
            creditScore: Number(body.creditScore) || 650,
            employmentType: body.employmentType || "salaried",
            employmentTenure: body.employmentTenure || "1-2yr",
            loanAmount: Number(body.loanAmount) || 500000,
            savings: body.savings || "0-50k",
        };

        console.log("\n");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║   🚀 REJECTION RECOVERY - ADK Multi-Agent Pipeline        ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║  Stage 1: 🕵️ Investigator (ADK Agent + Tools)             ║");
        console.log("║  Stage 2: 🐺 Negotiator (ADK Agent + Tools)                ║");
        console.log("║  Stage 3: 🏗️ Architect (ADK Agent + Tools)                ║");
        console.log("╚════════════════════════════════════════════════════════════╝");

        console.log("\n📥 INPUT DATA:");
        console.log(`   • Monthly Income: ₹${userData.monthlyIncome.toLocaleString()}`);
        console.log(`   • Existing EMI: ₹${userData.existingEMI.toLocaleString()}`);
        console.log(`   • Credit Score: ${userData.creditScore}`);
        console.log(`   • Employment: ${userData.employmentType} (${userData.employmentTenure})`);
        console.log(`   • Loan Amount: ₹${userData.loanAmount.toLocaleString()}`);
        console.log("");

        // Run the full ADK pipeline with 3 agents
        const result = await runADKRecoverySquad(userData);

        // Parse the JSON responses from each agent
        let investigationParsed = { rootCause: "Analysis in progress", hiddenFactor: "", severity: "Medium" as const, bulletPoints: [] as string[] };
        let strategyParsed = { strategyName: "Strategy in progress", actionItem: "", bulletPoints: [] as string[], negotiationScript: "" };
        let roadmapParsed = { step1: "", step2: "", step3: "", estimatedDays: 180 };

        try {
            const invMatch = result.investigation?.match(/\{[\s\S]*\}/);
            if (invMatch) investigationParsed = JSON.parse(invMatch[0]);
        } catch (e) { 
            console.warn("Failed to parse investigation JSON:", e); 
            investigationParsed.rootCause = result.investigation?.substring(0, 100) || "Analysis completed";
        }

        try {
            const stratMatch = result.strategy?.match(/\{[\s\S]*\}/);
            if (stratMatch) strategyParsed = JSON.parse(stratMatch[0]);
        } catch (e) { 
            console.warn("Failed to parse strategy JSON:", e);
            strategyParsed.strategyName = result.strategy?.substring(0, 50) || "Strategy completed";
            strategyParsed.negotiationScript = result.strategy?.substring(0, 200) || "";
        }

        try {
            const roadMatch = result.roadmap?.match(/\{[\s\S]*\}/);
            if (roadMatch) roadmapParsed = JSON.parse(roadMatch[0]);
        } catch (e) { 
            console.warn("Failed to parse roadmap JSON:", e);
            roadmapParsed.step1 = result.roadmap?.substring(0, 100) || "Planning in progress";
        }

        // Format response to match frontend expectations
        const stage1 = {
            agent: "Investigator",
            title: "Root Cause Analysis",
            result: investigationParsed,
        };

        const stage2 = {
            agent: "Negotiator",
            title: strategyParsed.strategyName || "Recovery Strategy",
            result: {
                strategy: strategyParsed.strategyName,
                negotiationScript: strategyParsed.negotiationScript,
                bulletPoints: strategyParsed.bulletPoints || [],
            },
        };

        const stage3 = {
            agent: "Architect",
            title: "Recovery Timeline",
            result: roadmapParsed,
        };

        console.log("\n╔════════════════════════════════════════════════════════════╗");
        console.log("║                    ✅ ADK PIPELINE COMPLETE                ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log(`║  Root Cause: ${(investigationParsed.rootCause || "").substring(0, 35)}...  ║`);
        console.log(`║  Strategy:  ${(strategyParsed.strategyName || "").substring(0, 35)}...  ║`);
        console.log(`║  Timeline:  ~${roadmapParsed.estimatedDays || 180} days                                   ║`);
        console.log("╚════════════════════════════════════════════════════════════╝\n");

        return NextResponse.json({
            success: true,
            stage1,
            stage2,
            stage3,
            _metadata: {
                mode: "adk-multi-agent",
                agents: ["investigator", "negotiator", "architect"],
                apiCalls: 3,
                sessionId: result.sessionId,
            },
        });

    } catch (error: any) {
        console.error("Recovery API error:", error);
        return NextResponse.json({
            error: error.message || "Recovery analysis failed. Please check API key configuration.",
        }, { status: 500 });
    }
}
