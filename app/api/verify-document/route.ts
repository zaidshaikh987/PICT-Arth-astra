import { NextResponse } from "next/server";
import { verifyDocument } from "@/lib/ai/doc-vision";

/**
 * API Endpoint for AI-Powered Document Verification
 * Uses Gemini 2.0 Flash Exp for multimodal forensic analysis
 */

export async function POST(req: Request) {
    try {
        const { imageData, documentType } = await req.json();

        if (!imageData || !documentType) {
            return NextResponse.json(
                { error: "Missing imageData or documentType" },
                { status: 400 }
            );
        }

        console.log(`\n👁️  VERTEX AI VISION VERIFICATION`);
        console.log(`📄 Document Type: ${documentType}`);

        // Call Gemini Vision
        const result = await verifyDocument(imageData, documentType);

        console.log(`   ✓ Valid: ${result.isValid ? "✅" : "❌"}`);
        console.log(`   ✓ Confidence: ${result.confidence}%`);
        if (result.issues.length > 0) {
            console.log(`   ⚠️  Issues: ${result.issues.join(", ")}`);
        }

        return NextResponse.json({
            success: true,
            verification: result,
        });
    } catch (error: any) {
        console.error("Verification API error:", error);
        return NextResponse.json(
            { error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}
