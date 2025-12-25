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
                message = `Hi ${userName}, we have received your documents! 📄 Our AI is now verifying them. Tracking ID: #LA-${Math.floor(Math.random() * 10000)} - LoanSaathi`
                break
            case "profile_setup":
                message = `Welcome to LoanSaathi, ${userName}! 🌟 Your profile has been created successfully. Next step: Upload your documents to proceed. - LoanSaathi`
                break
            case "credit_check_started":
                message = `Hi ${userName}, your Credit Check has started. 🔍 We are fetching your CIBIL score safely. - LoanSaathi`
                break
            case "credit_check_completed":
                message = `Great news ${userName}! 🎉 Your Credit Score of ${userData.creditScore} has been verified. You are eligible for the next stage! - LoanSaathi`
                break
            case "lender_match_found":
                message = `High Priority: We found 3 Lender Matches for your profile! 🏦 Interest rates starting from 10.5%. Check your dashboard to Apply. - LoanSaathi`
                break
            case "application_submitted":
                message = `Application Submitted! 🚀 We have sent your file to HDFC and ICICI. You should hear back within 24 hours. - LoanSaathi`
                break
            case "loan_approved":
                message = `CONGRATULATIONS ${userName}! 🎊 Your loan of ₹${userData.amount || "5 Lakhs"} has been APPROVED. Disbursal in progress. - LoanSaathi`
                break
            default:
                message = `Update on your Loan Application: Stage '${stage}' completed. - LoanSaathi`
        }

        // Format phone number to E.164 (assume India +91 if missing)
        let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '')
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN

        // Check if keys exist to determine mode
        if (!accountSid || !authToken) {
            console.log(`[Twilio Mock] ⚠️ Credentials missing. Mocking send to ${formattedPhone}: ${message}`)
            return NextResponse.json({ success: true, mock: true, message, recipient: formattedPhone })
        }

        console.log(`[Twilio Real] 🚀 Initializing Client with SID ending in ...${accountSid.slice(-4)}`)
        const client = twilio(accountSid, authToken)

        console.log(`[Twilio Real] 📨 Sending WhatsApp to ${formattedPhone}...`)

        try {
            const response = await client.messages.create({
                body: message,
                from: 'whatsapp:+14155238886', // Twilio Sandbox Number
                to: `whatsapp:${formattedPhone}`
            })

            console.log(`[Twilio Real] ✅ Success! SID: ${response.sid}`)
            return NextResponse.json({
                success: true,
                sid: response.sid,
                mode: 'real',
                recipient: formattedPhone
            })
        } catch (twilioError: any) {
            console.error(`[Twilio Real] ❌ Failed: ${twilioError.message}`)
            // If it's a "not joined sandbox" error (Code 63015)
            if (twilioError.code === 63015) {
                return NextResponse.json({
                    success: false,
                    error: "Sandbox not joined. Please join first.",
                    code: 63015
                }, { status: 400 })
            }
            throw twilioError
        }

    } catch (error: any) {
        console.error("[Twilio Error] Detailed Trace:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
