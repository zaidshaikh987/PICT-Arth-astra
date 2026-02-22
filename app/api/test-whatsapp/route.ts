import { NextResponse } from "next/server"

// Quick diagnostic route — open in browser:
// http://localhost:3000/api/test-whatsapp?phone=YOUR_NUMBER
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get("phone") || ""

    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN

    // Log what env vars look like
    console.log("[test-whatsapp] SID loaded:", sid ? `***${sid.slice(-4)}` : "MISSING ❌")
    console.log("[test-whatsapp] Token loaded:", token ? `***${token.slice(-4)}` : "MISSING ❌")
    console.log("[test-whatsapp] SID length:", sid?.length, "| Token length:", token?.length)
    console.log("[test-whatsapp] Phone target:", phone || "(not provided)")

    if (!sid || !token) {
        return NextResponse.json({
            ok: false,
            error: "Twilio credentials NOT loaded from env. Restart the dev server after editing .env.local",
            sid_present: !!sid,
            token_present: !!token,
        })
    }

    if (!phone) {
        return NextResponse.json({
            ok: true,
            message: "Credentials loaded ✅ — add ?phone=919XXXXXXXXX to also send a test WhatsApp",
            sid_tail: sid.slice(-4),
            token_tail: token.slice(-4),
        })
    }

    // Actually send a test message
    const { sendWhatsAppMessage } = await import("@/lib/notifications")
    const result = await sendWhatsAppMessage(phone, `✅ ArthAstra Test Message!\n\nTwilio is working correctly. Your WhatsApp notifications are active.\n— ArthAstra AI`)

    return NextResponse.json(result)
}
