import twilio from "twilio"

/**
 * Sends a WhatsApp message using the Twilio Sandbox.
 * - Auto-formats Indian phone numbers to E.164 (+91XXXXXXXXXX)
 * - Falls back to mock/log if Twilio credentials are not configured
 */
export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        // ── Clean and format the phone number ──
        let cleaned = to.replace(/[\s\-().]/g, "")   // strip spaces, dashes, parens, dots

        // Strip any leading zeros (Indian numbers sometimes come as 0XXXXXXXXXX)
        if (cleaned.startsWith("0") && !cleaned.startsWith("+")) {
            cleaned = cleaned.slice(1)
        }

        // Add +91 prefix if no country code
        if (!cleaned.startsWith("+")) {
            cleaned = `+91${cleaned}`
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
        const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()

        // ── Mock mode if credentials missing ──
        if (!accountSid || !authToken || accountSid === "" || authToken === "") {
            console.warn(`[Twilio] ⚠️  No credentials. MOCK send to ${cleaned}`)
            console.log(`[Twilio Mock Message]\n${message}`)
            return { success: true, mock: true, sid: "mock-sid", recipient: cleaned }
        }

        console.log(`[Twilio] 🚀 Sending WhatsApp to ${cleaned} via account ...${accountSid.slice(-4)}`)

        const client = twilio(accountSid, authToken)

        const response = await client.messages.create({
            body: message,
            from: "whatsapp:+14155238886",   // Twilio Sandbox number
            to: `whatsapp:${cleaned}`,
        })

        console.log(`[Twilio] ✅ Delivered! SID: ${response.sid} | Status: ${response.status}`)
        return { success: true, sid: response.sid, mode: "real", recipient: cleaned, status: response.status }

    } catch (error: any) {
        console.error(`[Twilio] ❌ Error: ${error.message} (code: ${error.code})`)

        // Twilio error 63015 = recipient has not joined the sandbox
        if (error.code === 63015) {
            return {
                success: false,
                error: "Recipient has not joined the Twilio sandbox. Ask them to send 'join <sandbox-word>' to +14155238886 first.",
                code: 63015
            }
        }
        // Twilio error 21211 = invalid phone number
        if (error.code === 21211) {
            return { success: false, error: "Invalid phone number format.", code: 21211 }
        }

        return { success: false, error: error.message, code: error.code }
    }
}
