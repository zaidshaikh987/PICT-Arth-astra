import { NextResponse } from "next/server";
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator";
import { generateWithRotation } from "@/lib/ai/gemini-client";

/**
 * Financial Council — Optimized
 * 
 * OLD: 3 sequential Gemini calls (Optimist → Pessimist → Judge) = 3 API calls
 * NEW: Tools for data + single Gemini call for debate narrative = 1 API call
 * 
 * Savings: 66% fewer API calls, 3x faster
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("\n");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║   🏛️ FINANCIAL COUNCIL (Optimized — 1 API call)           ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║  Data: eligibility-calculator.ts (0 API calls)           ║");
        console.log("║  Debate: Gemini 2.5 Flash (1 API call)                   ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("\n📋 INPUT DATA:");
        console.log("   • Income: ₹" + (body.monthlyIncome || "N/A").toLocaleString());
        console.log("   • Loan Amount: ₹" + (body.loanAmount || "N/A").toLocaleString());
        console.log("   • Credit Score: " + (body.creditScore || "650 (default)"));
        console.log("");

        // ═══════════════════════════════════════════════════════════
        // STEP 1: Get structured data from tools (0 API calls)
        // ═══════════════════════════════════════════════════════════
        const eligibility = calculateDetailedEligibility(body);

        console.log("   ✅ Tool analysis complete:");
        console.log(`      DTI: ${eligibility.financials.dti.toFixed(1)}% | Status: ${eligibility.overallStatus}`);
        console.log(`      Max Amount: ₹${eligibility.maxAmount.toLocaleString("en-IN")}`);
        console.log(`      Approval Odds: ${eligibility.approvalOdds}%`);

        // ═══════════════════════════════════════════════════════════
        // STEP 2: Single Gemini call for debate narrative (1 API call)
        // ═══════════════════════════════════════════════════════════
        const debatePrompt = `You are simulating a bank credit committee with 3 roles. Given the applicant data below, generate the debate.

APPLICANT DATA:
- Monthly Income: ₹${body.monthlyIncome || 30000}
- Existing EMI: ₹${body.existingEMI || 0}
- Credit Score: ${body.creditScore || 650}
- Employment: ${body.employmentType || "salaried"}
- Loan Amount Requested: ₹${body.loanAmount || 500000}
- DTI Ratio: ${eligibility.financials.dti.toFixed(1)}%
- Max Eligible Amount: ₹${eligibility.maxAmount.toLocaleString("en-IN")}
- Approval Odds (calculated): ${eligibility.approvalOdds}%
- Overall Status: ${eligibility.overallStatus}

Write the debate in this EXACT JSON format. Make it INTENSE and DATA-DRIVEN.
- The OPTIMIST must cite specific strengths: "Approval odds of ${eligibility.approvalOdds}%", "DTI of ${eligibility.financials.dti.toFixed(1)}% is healthy".
- The PESSIMIST must cite specific risks: "Requested ₹${(body.loanAmount || 0).toLocaleString()} exceeds safe limits", "Credit score ${body.creditScore} is too low".
- The JUDGE must reference the specific numbers in the final verdict.

{
  "optimistArgument": "Optimist's argument citing specific numbers",
  "pessimistArgument": "Pessimist's argument citing specific numbers",
  "judgeVerdict": "Final verdict referencing the ${eligibility.approvalOdds}% probability",
  "approved": boolean (true if approvalOdds > 60),
  "confidence": number (use ${eligibility.approvalOdds})
}

Return ONLY valid JSON.`;

        let debateResult: any;

        try {
            const responseText = await generateWithRotation("gemini-2.5-flash", debatePrompt, {
                temperature: 0.8,
                maxOutputTokens: 1000,
            });

            console.log("   🤖 Debate generated (1 API call)");

            // Parse JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                debateResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse debate JSON");
            }
        } catch (err: any) {
            console.warn("   ⚠️ Gemini debate failed, using deterministic fallback:", err.message);

            // Deterministic fallback — no API call needed
            const isApproved = eligibility.approvalOdds > 60;
            const strengths = eligibility.factors.filter(f => f.status === "pass").map(f => f.name);
            const weaknesses = eligibility.factors.filter(f => f.status !== "pass").map(f => f.name);

            debateResult = {
                optimistArgument: strengths.length > 0
                    ? `The applicant demonstrates strong financial discipline with passing grades in ${strengths.join(", ")}. With a DTI of only ${eligibility.financials.dti.toFixed(1)}%, they have sufficient capacity for this loan.`
                    : `While the profile has challenges, the applicant shows initiative. A smaller loan amount could work.`,
                pessimistArgument: weaknesses.length > 0
                    ? `We cannot ignore the risks. The ${weaknesses[0]} is a major red flag. A DTI of ${eligibility.financials.dti.toFixed(1)}% leaves little room for error.`
                    : `Current market volatility requires us to be cautious despite the decent metrics.`,
                judgeVerdict: isApproved
                    ? `Approved. The data is clear: ${eligibility.approvalOdds}% approval odds and a healthy DTI of ${eligibility.financials.dti.toFixed(1)}% outweigh the minor risks.`
                    : `Rejected. The risk factors, particularly ${weaknesses[0] || "overall creditworthiness"}, are too high at this time.`,
                approved: isApproved,
                confidence: eligibility.approvalOdds,
            };
        }

        console.log("\n╔════════════════════════════════════════════════════════════╗");
        console.log("║                    📜 FINAL VERDICT                        ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║  Decision: " + (debateResult.approved ? "✅ APPROVED" : "❌ REJECTED") + "                                       ║");
        console.log("║  Confidence: " + (debateResult.confidence || 50) + "%                                        ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("\n");

        return NextResponse.json({
            optimistArgument: debateResult.optimistArgument || "No argument provided.",
            pessimistArgument: debateResult.pessimistArgument || "No argument provided.",
            judgeVerdict: debateResult.judgeVerdict || "No verdict.",
            approved: debateResult.approved ?? false,
            confidence: debateResult.confidence ?? 50,
            _metadata: {
                mode: "tools-first",
                apiCalls: 1,
                previousApiCalls: 3,
                savings: "66%",
                toolData: {
                    dti: eligibility.financials.dti,
                    approvalOdds: eligibility.approvalOdds,
                    maxAmount: eligibility.maxAmount,
                    status: eligibility.overallStatus,
                },
            },
        });

    } catch (error: any) {
        console.error("Council Error:", error);
        return NextResponse.json({
            optimistArgument: "Service temporarily unavailable.",
            pessimistArgument: "Service temporarily unavailable.",
            judgeVerdict: `Error: ${error.message}`,
            approved: false,
        }, { status: 500 });
    }
}
