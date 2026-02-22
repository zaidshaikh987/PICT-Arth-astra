import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { stage, userData } = await req.json()

        const name = userData?.name || "Customer"
        const phone = userData?.phone || ""
        const amount = userData?.amount
            ? `₹${Number(userData.amount.toString().replace(/,/g, "")).toLocaleString("en-IN")}`
            : (userData?.loanAmount ? `₹${Number(userData.loanAmount).toLocaleString("en-IN")}` : "₹5,00,000")
        const emi = userData?.emi ? `₹${Number(userData.emi).toLocaleString("en-IN")}` : ""
        const tenure = userData?.tenure || ""
        const refId = userData?.refId || `HDFC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
        const creditScore = userData?.creditScore || ""
        const bank = userData?.bankName || "HDFC Bank"

        if (!phone) {
            console.warn(`[Notify] No phone number provided for stage: ${stage}`)
            return NextResponse.json({ success: false, error: "No phone number provided" }, { status: 400 })
        }

        console.log(`\n[API/Notify] ✉️  Stage: ${stage} | User: ${name} | Phone: ${phone}`)

        let message = ""

        switch (stage) {
            case "profile_setup":
                message =
                    `🌟 *Welcome to ArthAstra, ${name}!*\n\n` +
                    `Your profile has been created successfully.\n\n` +
                    `✅ Step 1: Profile Setup — Done\n` +
                    `📄 Step 2: Upload Documents — *Pending*\n` +
                    `🔍 Step 3: Credit Check — Pending\n` +
                    `🏦 Step 4: Lender Match — Pending\n\n` +
                    `Head to your dashboard to upload PAN, Aadhaar, and salary slip to proceed.\n` +
                    `👉 arthastra.vercel.app/dashboard\n\n` +
                    `— *ArthAstra AI*`
                break

            case "docs_uploaded":
                message =
                    `📄 *Documents Received, ${name}!*\n\n` +
                    `Our Gemini AI Vision is now verifying your uploaded documents. This usually takes under 60 seconds.\n\n` +
                    `Documents being verified:\n` +
                    `• PAN Card\n• Aadhaar Card\n• Salary Slip\n• Bank Statement\n\n` +
                    `You will receive another notification once verification is complete.\n\n` +
                    `— *ArthAstra AI*`
                break

            case "credit_check_started":
                message =
                    `🔍 *Credit Check Initiated, ${name}!*\n\n` +
                    `We are performing a soft inquiry on your CIBIL credit report.\n\n` +
                    `⚠️ This is a *soft check only* — it does NOT affect your credit score.\n\n` +
                    `Results will be ready in a few moments.\n\n` +
                    `— *ArthAstra AI*`
                break

            case "credit_check_completed":
                message =
                    `✅ *Credit Check Complete, ${name}!*\n\n` +
                    `Your CIBIL score: *${creditScore || "Fetched"}*\n\n` +
                    `${Number(creditScore) >= 700
                        ? "🟢 Excellent score! You qualify for the best interest rates."
                        : Number(creditScore) >= 600
                            ? "🟡 Good score. You qualify for most loan products."
                            : "🔴 Lower score detected. Limited options available — we will find the best match."
                    }\n\n` +
                    `Next step: View your matched loan offers.\n` +
                    `👉 arthastra.vercel.app/dashboard/loans\n\n` +
                    `— *ArthAstra AI*`
                break

            case "lender_match_found":
                message =
                    `🏦 *Lender Match Found, ${name}!*\n\n` +
                    `ArthAstra AI has analysed 12+ lenders and matched you with the best offer:\n\n` +
                    `🏆 *${bank} — Personal Loan*\n` +
                    `• Amount: *${amount}*\n` +
                    `• Interest Rate: *10.5% p.a.*\n` +
                    `• Monthly EMI: *${emi || "Calculated"}*\n` +
                    `• Tenure: *${tenure ? tenure + " years" : "Flexible"}*\n\n` +
                    `Ready to apply? Open your dashboard now:\n` +
                    `👉 arthastra.vercel.app/dashboard/loans\n\n` +
                    `— *ArthAstra AI*`
                break

            case "application_submitted":
                message =
                    `🚀 *Application Submitted to ${bank}!*\n\n` +
                    `Hi ${name}, your loan application has been officially submitted.\n\n` +
                    `📋 *Application Summary:*\n` +
                    `• Loan Amount: *${amount}*\n` +
                    `• EMI: *${emi || "As calculated"}*\n` +
                    `• Tenure: *${tenure ? tenure + " years" : "N/A"}*\n` +
                    `• Interest Rate: *10.5% p.a.*\n` +
                    `• Reference ID: *${refId}*\n\n` +
                    `⏳ ${bank} typically responds within *2 business days*.\n\n` +
                    `Track your status:\n` +
                    `👉 arthastra.vercel.app/dashboard/timeline\n\n` +
                    `— *ArthAstra AI*`
                break

            case "loan_approved":
                message =
                    `🎊 *LOAN APPROVED — Congratulations, ${name}!*\n\n` +
                    `${bank} has *approved* your loan application!\n\n` +
                    `✅ *Final Approval Details:*\n` +
                    `• Approved Amount: *${amount}*\n` +
                    `• Monthly EMI: *${emi || "As calculated"}*\n` +
                    `• Tenure: *${tenure ? tenure + " years" : "N/A"}*\n` +
                    `• Reference ID: *${refId}*\n\n` +
                    `💰 Disbursal to your registered bank account within *1–2 business days*.\n\n` +
                    `View your approval letter:\n` +
                    `👉 arthastra.vercel.app/dashboard/timeline\n\n` +
                    `Thank you for trusting ArthAstra! 🙌\n\n` +
                    `— *ArthAstra AI*`
                break

            case "loan_rejected":
                message =
                    `📋 *Application Update, ${name}*\n\n` +
                    `Unfortunately, ${bank} could not approve your application at this time.\n\n` +
                    `*Don't worry — here's what you can do:*\n` +
                    `• Try a lower loan amount\n` +
                    `• Improve your credit score over 3–6 months\n` +
                    `• Explore other lenders on ArthAstra\n\n` +
                    `👉 arthastra.vercel.app/dashboard/rejection-recovery\n\n` +
                    `Our AI Advisor is ready to help:\n` +
                    `👉 arthastra.vercel.app/dashboard/chat\n\n` +
                    `— *ArthAstra AI*`
                break

            default:
                message =
                    `📢 *ArthAstra Update, ${name}*\n\n` +
                    `Your application status: *${stage.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}*\n\n` +
                    `Check your dashboard for details:\n` +
                    `👉 arthastra.vercel.app/dashboard\n\n` +
                    `— *ArthAstra AI*`
        }

        const { sendWhatsAppMessage } = await import("@/lib/notifications")
        const result = await sendWhatsAppMessage(phone, message)

        if (!result.success) {
            console.error(`[Notify] Failed to send: ${JSON.stringify(result)}`)
            return NextResponse.json(result, { status: 500 })
        }

        console.log(`[Notify] ✅ WhatsApp sent! SID: ${result.sid}`)
        return NextResponse.json(result)

    } catch (error: any) {
        console.error("[Notify] Error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
