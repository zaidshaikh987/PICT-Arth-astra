import twilio from "twilio"

export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        // Format phone number to E.164 (assume India +91 if missing)
        let formattedPhone = to.replace(/\s+/g, '').replace(/-/g, '')
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN

        // Mock mode if credentials missing
        if (!accountSid || !authToken) {
            console.log(`[Twilio Mock] ⚠️ Credentials missing. Mocking send to ${formattedPhone}: ${message}`)
            return { success: true, mock: true, sid: "mock-sid", recipient: formattedPhone }
        }

        console.log(`[Twilio Real] 🚀 Initializing Client with SID ending in ...${accountSid.slice(-4)}`)
        const client = twilio(accountSid, authToken)

        console.log(`[Twilio Real] 📨 Sending WhatsApp to ${formattedPhone}...`)

        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Twilio Sandbox Number
            to: `whatsapp:${formattedPhone}`
        })

        console.log(`[Twilio Real] ✅ Success! SID: ${response.sid}`)
        return { success: true, sid: response.sid, mode: 'real', recipient: formattedPhone }

    } catch (error: any) {
        console.error(`[Twilio Error] ❌ Failed: ${error.message}`)
        // Check for "not joined sandbox" error (Code 63015)
        if (error.code === 63015) {
            return { success: false, error: "Sandbox not joined", code: 63015 }
        }
        return { success: false, error: error.message }
    }
}
