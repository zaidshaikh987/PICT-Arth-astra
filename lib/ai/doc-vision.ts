import { GoogleGenAI } from "@google/genai";

/**
 * Document Vision Verification
 * Uses gemini-2.0-flash-exp for multimodal document forensics
 */

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export interface VerificationResult {
    isValid: boolean;
    confidence: number;
    issues: string[];
    extractedData?: {
        name?: string;
        documentNumber?: string;
        dateOfBirth?: string;
    };
}

/**
 * Verify document authenticity using Gemini Vision
 */
export async function verifyDocument(
    imageData: string,
    documentType: "pan" | "aadhaar" | "salary_slip" | "bank_statement"
): Promise<VerificationResult> {
    try {
        console.log(`👁️ Analyzing ${documentType} with Gemini Vision...`);

        const prompts = {
            pan: `Analyze this PAN card image forensically:
1. Is the format valid? (ABCDE1234F pattern)
2. Is the image clear?
3. Are there signs of editing?
4. Extract EXACTLY: FullName, PANNumber, DateOfBirth

IMPORTANT: Return ONLY JSON. No markdown.
Format: {"isValid": boolean, "confidence": 0-100, "issues": [], "name": "extracted name", "number": "extracted PAN", "dob": "dd/mm/yyyy"}`,

            aadhaar: `Analyze this Aadhaar card forensically:
1. Is it a valid Aadhaar format? (12 digits or masked)
2. Is the image quality acceptable?
3. Are there signs of editing?
4. Extract EXACTLY: FullName, AadhaarNumber

IMPORTANT: Return ONLY JSON. No markdown.
Format: {"isValid": boolean, "confidence": 0-100, "issues": [], "name": "extracted name", "number": "extracted Aadhaar"}`,

            salary_slip: `Analyze this salary slip:
1. Is it a valid pay slip?
2. Are salary components visible?
3. Is it recent?
4. Extract: EmployeeName, NetSalary, MonthYear

IMPORTANT: Return ONLY JSON. No markdown.
Format: {"isValid": boolean, "confidence": 0-100, "issues": [], "name": "employee name", "salary": "amount"}`,

            bank_statement: `Analyze this bank statement:
1. Is it an official bank document?
2. Are transactions visible?
3. Extract: AccountHolderName, BankName

IMPORTANT: Return ONLY JSON. No markdown.
Format: {"isValid": boolean, "confidence": 0-100, "issues": [], "name": "account holder", "bank": "bank name"}`,
        };

        // Use gemini-2.5-flash which works in base-agent.ts
        const MODEL_NAME = "gemini-2.5-flash";
        console.log("🤖 calling model:", MODEL_NAME);

        // Detect MIME type and base64 data
        let mimeType = "image/jpeg";
        let base64Data = imageData;

        if (imageData.includes(";base64,")) {
            const parts = imageData.split(";base64,");
            mimeType = parts[0].replace("data:", "");
            base64Data = parts[1];
        }

        console.log(`📂 Processing document format: ${mimeType}`);

        const result = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompts[documentType] },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data,
                            },
                        },
                    ],
                },
            ],
        });

        const responseText = result.text || "{}";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return {
            isValid: parsed.isValid || false,
            confidence: parsed.confidence || 0,
            issues: parsed.issues || [],
            extractedData: {
                name: parsed.name,
                documentNumber: parsed.number || parsed.panNumber,
                dateOfBirth: parsed.dob,
            },
        };
    } catch (error: any) {
        console.error("Vision verification error:", error);
        return {
            isValid: false,
            confidence: 0,
            issues: ["Vision API error: " + error.message],
        };
    }
}

/**
 * Batch verify multiple documents
 */
export async function verifyDocuments(
    documents: Array<{ type: "pan" | "aadhaar" | "salary_slip" | "bank_statement"; imageData: string }>
): Promise<Map<string, VerificationResult>> {
    const results = new Map<string, VerificationResult>();

    for (const doc of documents) {
        const result = await verifyDocument(doc.imageData, doc.type);
        results.set(doc.type, result);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}
