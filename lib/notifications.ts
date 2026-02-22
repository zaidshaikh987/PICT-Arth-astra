import twilio from "twilio"

/**
 * Sends a WhatsApp message using the Twilio Sandbox.
 * Correctly handles all Indian phone number formats:
 *   - 9529123226       (10 digit local)
 *   - 919529123226     (12 digit with country code, no +)
 *   - +919529123226    (full E.164)
 *   - 09529123226      (leading zero)
 *   - +91919529123226  (double-prefix bug — also corrected)
 */
export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        // ── Step 1: Strip all non-digit characters (spaces, dashes, parens, +) ──
        let digits = to.replace(/\D/g, "")

        // ── Step 2: Strip leading zeros ──
        digits = digits.replace(/^0+/, "")

        // ── Step 3: Detect and fix double-prefix (91919XXXXXXXXX = 14 digits starting 9191) ──
        if (digits.length === 14 && digits.startsWith("9191")) {
            digits = digits.slice(2)   // remove one "91" → 12 digits
        }

        // ── Step 4: If 12 digits starting with 91 — already has country code ──
        let e164: string
        if (digits.length === 12 && digits.startsWith("91")) {
            e164 = `+${digits}`              // +91XXXXXXXXXX
        } else if (digits.length === 10) {
            e164 = `+91${digits}`            // +91 + 10 digit number
        } else {
            // Fallback: trust what they gave us
            e164 = `+${digits}`
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
        const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()

        // ── Mock mode if credentials missing ──
        if (!accountSid || !authToken) {
            console.warn(`[Twilio] ⚠️  No credentials. MOCK send to ${e164}`)
            console.log(`[Twilio Mock]\n${message}`)
            return { success: true, mock: true, sid: "mock-sid", recipient: e164 }
        }

        console.log(`[Twilio] 🚀 Sending WhatsApp to ${e164} (original: ${to})`)

        const client = twilio(accountSid, authToken)

        const response = await client.messages.create({
            body: message,
            from: "whatsapp:+14155238886",   // Twilio Sandbox number
            to: `whatsapp:${e164}`,
        })

        console.log(`[Twilio] ✅ Delivered! SID: ${response.sid} | Status: ${response.status}`)
        return { success: true, sid: response.sid, mode: "real", recipient: e164, status: response.status }

    } catch (error: any) {
        console.error(`[Twilio] ❌ Error: ${error.message} (code: ${error.code})`)
        if (error.code === 63015) {
            return { success: false, error: "Recipient has not joined the Twilio sandbox. Send 'join unless-they' to +14155238886 on WhatsApp.", code: 63015 }
        }
        if (error.code === 21211) {
            return { success: false, error: "Invalid phone number format.", code: 21211 }
        }
        return { success: false, error: error.message, code: error.code }
    }
}
