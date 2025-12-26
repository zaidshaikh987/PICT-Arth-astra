import { NextResponse } from "next/server";
import { runADKRecoverySquad } from "@/lib/agents/adk-recovery-squad";
import { calculateDTI } from "@/lib/tools/agent-tools";

// ===============================================
// MAIN API ROUTE (Switched to ADK)
// ===============================================
export async function POST(req: Request) {
    let body: any = {};

    try {
        body = await req.json();

        console.log("\n🔧 ADK Pipeline: Starting Recovery Squad...\n");

        // Execute Real ADK Pipeline
        const result = await runADKRecoverySquad(body);

        // Helper to safely parse agent output (ADK returns pure JSON strings now)
        const safeParse = (text: string, fallback: any) => {
            console.log("Raw Agent Output:", text); // DEBUG LOG
            try {
                // Strip markdown formatting if present
                const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(cleanText);
            } catch (e) {
                console.warn("JSON Parse Error for agent output. Raw text:", text.substring(0, 100) + "...");
                return fallback;
            }
        };

        const investigation = safeParse(result.investigation, {
            rootCause: "Analysis incomplete",
            hiddenFactor: "Unknown",
            severity: "Medium",
            bulletPoints: ["Could not parse investigation results"]
        });

        const strategy = safeParse(result.strategy, {
            strategyName: "Standard Recovery",
            actionItem: "Contact support",
            bulletPoints: ["Could not parse strategy results"],
            negotiationScript: "Please review my application again."
        });

        const plan = safeParse(result.roadmap, {
            step1: "Review finances",
            step2: "Save money",
            step3: "Re-apply",
            estimatedDays: 30
        });

        console.log("\n✅ ADK Pipeline Complete\n");

        return NextResponse.json({
            stage1_investigation: investigation,
            stage2_strategy: strategy,
            stage3_plan: plan,
            _adk_metadata: {
                sessionId: result.sessionId,
                poweredBy: "@google/adk"
            }
        });

    } catch (error: any) {
        console.error("Recovery Squad Error:", error);

        // Fallback (same as before)
        const dti = calculateDTI(
            body.monthlyIncome || 150000,
            body.existingEMI || 30000,
            body.monthlyExpenses || 10000
        );

        return NextResponse.json({
            stage1_investigation: {
                rootCause: "System overloaded or high employment risk",
                hiddenFactor: "Income mismatch",
                severity: "High",
                bulletPoints: [
                    `DTI Ratio: ${dti}% (computed via tool)`,
                    "Employment checks pending",
                    "Savings validation required",
                ],
            },
            stage2_strategy: {
                strategyName: "Documentation Recovery",
                actionItem: "Submit full financial documents",
                bulletPoints: [
                    "Request employer letter",
                    "Provide bank statements",
                    "Lower requested amount",
                ],
                negotiationScript:
                    "I can provide additional documentation to prove my repayment capacity.",
            },
            stage3_plan: {
                step1: "Gather documents (Week 1)",
                step2: "Submit dispute letter to credit bureau (Week 2-4)",
                step3: "Build ₹50k emergency fund via auto-debit (Month 2-6)",
                estimatedDays: 180,
            },
        });
    }
}
