import { NextResponse } from "next/server";
import { runADKFinancialCouncil } from "@/lib/agents/adk-council";

// ===============================================
// MAIN API ROUTE (Switched to ADK)
// ===============================================
export async function POST(req: Request) {
    let body: any = {};

    try {
        body = await req.json();

        console.log("\n🏛️  ADK Financial Council: Starting debate...\n");

        // Execute Real ADK Debate
        const result = await runADKFinancialCouncil(body);

        return NextResponse.json({
            optimistArgument: result.optimist || "Optimist is silent.",
            pessimistArgument: result.pessimist || "Pessimist is silent.",
            judgeVerdict: result.judgment.verdict || "No verdict reached.",
            approved: result.judgment.approved,
            _adk_metadata: {
                sessionId: result.sessionId,
                poweredBy: "@google/adk"
            }
        });

    } catch (error: any) {
        console.error("Council Error:", error);

        return NextResponse.json({
            optimistArgument: "Error occurred during debate.",
            pessimistArgument: "Error occurred during debate.",
            judgeVerdict: `Error: ${error.message || "Unknown error"}`,
            approved: false
        });
    }
}
