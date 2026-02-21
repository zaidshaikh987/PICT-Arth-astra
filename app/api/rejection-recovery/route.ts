import { NextResponse } from "next/server";
import { calculateDTI, analyzeEmploymentRisk, detectFinancialAnomalies, simulateCreditScoreImpact, calculateSavingsTimeline } from "@/lib/tools/agent-tools";
import { generateWithRotation } from "@/lib/ai/gemini-client";

/**
 * Rejection Recovery API — Optimized
 * 
 * OLD: 3 sequential Gemini calls (Investigator → Negotiator → Architect) = 3 API calls
 * NEW: Tools first (0 API calls) → Single Gemini call for narrative (1 API call)
 * 
 * Savings: 66% fewer API calls, 3x faster
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const monthlyIncome = Number(body.monthlyIncome) || 30000;
        const existingEMI = Number(body.existingEMI) || 0;
        const monthlyExpenses = Number(body.monthlyExpenses) || Math.round(monthlyIncome * 0.3);
        const creditScore = Number(body.creditScore) || 650;
        const employmentType = body.employmentType || "salaried";
        const employmentTenure = body.employmentTenure || "1-2yr";
        const loanAmount = Number(body.loanAmount) || 500000;
        const savings = body.savings || "0-50k";

        console.log("\n");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║   🔧 REJECTION RECOVERY (Optimized — Tools First)        ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║  Stage 1: Tools (0 API calls)                            ║");
        console.log("║  Stage 2: Tools (0 API calls)                            ║");
        console.log("║  Stage 3: Tools (0 API calls)                            ║");
        console.log("║  Narrative: Gemini 2.5 Flash (1 API call, optional)      ║");
        console.log("╚════════════════════════════════════════════════════════════╝");

        // ═══════════════════════════════════════════════════════════
        // STAGE 1: THE INVESTIGATOR (Pure TypeScript — 0 API calls)
        // ═══════════════════════════════════════════════════════════
        console.log("\n┌─── STAGE 1: 🕵️ THE INVESTIGATOR (Tools) ───┐");

        const dti = calculateDTI(monthlyIncome, existingEMI, monthlyExpenses);
        const employmentRisk = analyzeEmploymentRisk(employmentType, employmentTenure);
        const anomalies = detectFinancialAnomalies({
            monthlyIncome,
            existingEMI,
            monthlyExpenses,
            employmentType,
            savings,
            creditScore,
        });

        // Determine root causes
        const rootCauses: string[] = [];
        if (dti > 40) rootCauses.push(`High DTI (${dti}% — banks reject above 40%)`);
        if (creditScore < 700) rootCauses.push(`Low Credit Score (${creditScore} — need 700+ for unsecured loans)`);
        if (employmentRisk.riskLevel === "Critical" || employmentRisk.riskLevel === "High") {
            rootCauses.push(`${employmentRisk.riskLevel} Employment Risk: ${employmentRisk.reason}`);
        }
        if (anomalies.hasAnomaly) {
            anomalies.anomalies.forEach(a => rootCauses.push(`Anomaly: ${a}`));
        }
        if (rootCauses.length === 0) {
            rootCauses.push("Profile appears strong — rejection may be bank-specific");
        }

        const stage1 = {
            agent: "Investigator",
            title: "Root Cause Analysis",
            result: {
                dtiRatio: `${dti}%`,
                dtiStatus: dti <= 40 ? "Safe" : dti <= 50 ? "Moderate Risk" : "High Risk",
                employmentRisk: employmentRisk,
                anomalies: anomalies,
                rootCauses: rootCauses,
                verdict: rootCauses.length > 0
                    ? `Found ${rootCauses.length} rejection factor(s). Primary: ${rootCauses[0]}`
                    : "No obvious rejection factors detected.",
            },
        };
        console.log(`   ✅ DTI: ${dti}% | Risk: ${employmentRisk.riskLevel} | Causes: ${rootCauses.length}`);

        // ═══════════════════════════════════════════════════════════
        // STAGE 2: THE NEGOTIATOR (Pure TypeScript — 0 API calls)
        // ═══════════════════════════════════════════════════════════
        console.log("├─── STAGE 2: 🐺 THE NEGOTIATOR (Tools) ──────┤");

        // Determine recommended actions based on root causes
        const actions: string[] = [];
        if (dti > 40) actions.push("pay_off_debt");
        if (creditScore < 750) actions.push("reduce_utilization");
        if (anomalies.hasAnomaly) actions.push("dispute_error");

        const creditImpact = simulateCreditScoreImpact(creditScore, actions);

        // Generate strategy based on profile
        let strategyName = "General Improvement";
        let negotiationScript = "";

        if (employmentRisk.riskLevel === "Critical" && employmentType === "student") {
            strategyName = "The Proprietor Pivot";
            negotiationScript = "Position yourself as a Sole Proprietor instead of Student. Register a business, route income through a current account, and apply after 6 months of statements.";
        } else if (dti > 50) {
            strategyName = "Debt Snowball Attack";
            negotiationScript = `Reduce DTI from ${dti}% to below 40% by clearing ₹${Math.round(existingEMI * 3).toLocaleString("en-IN")} in existing debt. Start with the highest-interest loan first.`;
        } else if (creditScore < 650) {
            strategyName = "Credit Rehabilitation";
            negotiationScript = `Improve score from ${creditScore} to ${creditImpact.projectedScore} by: ${actions.join(", ")}. Expected improvement: +${creditImpact.projectedScore - creditScore} points over 3-6 months.`;
        } else if (dti > 40) {
            strategyName = "DTI Optimization";
            negotiationScript = `Reduce obligations by ₹${Math.round((dti - 35) / 100 * monthlyIncome).toLocaleString("en-IN")}/month to bring DTI from ${dti}% to a safe 35%.`;
        } else {
            strategyName = "Profile Strengthening";
            negotiationScript = `Your profile is reasonably strong (DTI: ${dti}%, Score: ${creditScore}). Focus on building 6+ months of bank statement history and apply to NBFCs with relaxed criteria.`;
        }

        const stage2 = {
            agent: "Negotiator",
            title: strategyName,
            result: {
                strategy: strategyName,
                negotiationScript: negotiationScript,
                creditImpact: creditImpact,
                projectedScore: creditImpact.projectedScore,
                recommendedActions: actions,
            },
        };
        console.log(`   ✅ Strategy: ${strategyName} | Projected Score: ${creditImpact.projectedScore}`);

        // ═══════════════════════════════════════════════════════════
        // STAGE 3: THE ARCHITECT (Pure TypeScript — 0 API calls)
        // ═══════════════════════════════════════════════════════════
        console.log("├─── STAGE 3: 🏗️ THE ARCHITECT (Tools) ────────┤");

        // Parse savings to number
        let currentSavings = 25000;
        if (savings.includes("50k-1L")) currentSavings = 75000;
        else if (savings.includes("1L-5L")) currentSavings = 300000;
        else if (savings.includes("5L+")) currentSavings = 500000;

        const targetSavings = loanAmount * 0.2; // 20% down payment target
        const monthlySavingsRate = Math.max(1000, monthlyIncome - existingEMI - monthlyExpenses);

        const timeline = calculateSavingsTimeline(currentSavings, targetSavings, monthlySavingsRate);

        // Build action plan
        const actionPlan = [];
        if (employmentRisk.riskLevel === "Critical" || employmentRisk.riskLevel === "High") {
            actionPlan.push({ week: "Week 1-2", action: "Stabilize employment documentation", impact: "Removes primary rejection factor" });
        }
        if (dti > 40) {
            actionPlan.push({ week: "Month 1-3", action: `Reduce monthly obligations by ₹${Math.round((dti - 35) / 100 * monthlyIncome).toLocaleString("en-IN")}`, impact: `Brings DTI from ${dti}% to ~35%` });
        }
        if (creditScore < 750) {
            actionPlan.push({ week: "Month 1-6", action: `Improve credit score (current: ${creditScore}, target: ${creditImpact.projectedScore})`, impact: `Unlocks ${creditImpact.projectedScore >= 750 ? "premium" : "standard"} rates` });
        }
        actionPlan.push({ week: `Month ${Math.max(3, timeline.months)}`, action: "Re-apply with improved profile", impact: "Significantly higher approval odds" });

        const stage3 = {
            agent: "Architect",
            title: "Recovery Timeline",
            result: {
                savingsTimeline: timeline,
                estimatedRecoveryMonths: Math.max(3, timeline.months),
                actionPlan: actionPlan,
                readinessDate: new Date(Date.now() + Math.max(3, timeline.months) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
            },
        };
        console.log(`   ✅ Recovery: ${Math.max(3, timeline.months)} months | Target: ${stage3.result.readinessDate}`);
        console.log("└──────────────────────────────────────────────┘\n");

        // ═══════════════════════════════════════════════════════════
        // OPTIONAL: Single Gemini call to humanize the narrative
        // ═══════════════════════════════════════════════════════════
        let aiNarrative = "";
        try {
            const narrativePrompt = `You are a helpful, data-driven financial advisor. 
1. Analyze this specific rejection case:
- Root Causes: ${rootCauses.join("; ")}
- Strategy: ${strategyName}
- Key Actions: ${negotiationScript}
- Timeline: ${Math.max(3, timeline.months)} months

2. Write a 2-3 sentence summary that is HIGHLY SPECIFIC to these numbers.
- Mention the exact credit score target (${creditImpact.projectedScore}) if relevant.
- Mention the exact debt reduction amount if relevant.
- Do NOT use generic phrases like "financial journey". Be tactical.

Output specific, actionable advice only.`;

            aiNarrative = await generateWithRotation("gemini-2.5-flash", narrativePrompt, { temperature: 0.8, maxOutputTokens: 200 });
            console.log("   🤖 AI Narrative generated (1 API call)");
        } catch (err: any) {
            console.warn("   ⚠️ AI narrative skipped (quota):", err.message);
            aiNarrative = `Based on our analysis, your primary challenge is ${rootCauses[0] || "profile optimization"}. By following the "${strategyName}" strategy, you can significantly improve your approval chances within ${Math.max(3, timeline.months)} months.`;
        }

        return NextResponse.json({
            success: true,
            stage1,
            stage2,
            stage3,
            aiNarrative,
            _metadata: {
                mode: "tools-first",
                apiCalls: aiNarrative ? 1 : 0,
                previousApiCalls: 3,
                savings: "66-100%",
            },
        });

    } catch (error: any) {
        console.error("Recovery API error:", error);
        return NextResponse.json({
            error: error.message || "Recovery analysis failed",
        }, { status: 500 });
    }
}
