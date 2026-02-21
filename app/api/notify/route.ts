import { NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: Request) {
    try {
        const { stage, userData } = await req.json()
        const userName = userData?.name || "Customer"
        const phone = userData?.phone || "+91XXXXXXXXXX"

        console.log(`[API/Notify] Received request: ${stage} for ${userName} (${phone})`)

        let message = ""

        switch (stage) {
            case "docs_uploaded":
                message = `Hi ${userName}, we have received your documents! 📄 Our AI is now verifying them. Tracking ID: #LA-${Math.floor(Math.random() * 10000)} - ArthAstra`
                break
            case "profile_setup":
                message = `Welcome to ArthAstra, ${userName}! 🌟 Your profile has been created successfully. Next step: Upload your documents to proceed. - ArthAstra`
                break
            case "credit_check_started":
                message = `Hi ${userName}, your Credit Check has started. 🔍 We are fetching your CIBIL score safely. - ArthAstra`
                break
            case "credit_check_completed":
                message = `Great news ${userName}! 🎉 Your Credit Score of ${userData.creditScore} has been verified. You are eligible for the next stage! - ArthAstra`
                break
            case "lender_match_found":
                message = `High Priority: We found 3 Lender Matches for your profile! 🏦 Interest rates starting from 10.5%. Check your dashboard to Apply. - ArthAstra`
                break
            case "application_submitted":
                message = `Application Submitted! 🚀 We have sent your file to HDFC and ICICI. You should hear back within 24 hours. - ArthAstra`
                break
            case "loan_approved":
                message = `CONGRATULATIONS ${userName}! 🎊 Your loan of ₹${userData.amount || "5 Lakhs"} has been APPROVED. Disbursal in progress. - ArthAstra`
                break
            default:
                message = `Update on your Loan Application: Stage '${stage}' completed. - ArthAstra`
        }

        // Format phone number and send WhatsApp
        // Use the shared helper function
        const { sendWhatsAppMessage } = await import("@/lib/notifications")

        const result = await sendWhatsAppMessage(phone, message)

        if (!result.success) {
            return NextResponse.json(result, { status: result.code === 63015 ? 400 : 500 })
        }

        return NextResponse.json(result)

    } catch (error: any) {
        console.error("[Twilio Error] Detailed Trace:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
