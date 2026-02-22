export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Alert } from "@/lib/models/alert"
import { sendWhatsAppMessage } from "@/lib/notifications"

// GET /api/cron/process-dropoffs
// This route should be called by a Cron Job (e.g. Vercel Cron, GitHub Actions, or manual cURL)
// It scans for users who have been inactive for > 24 hours and have not completed onboarding.

export async function GET(req: Request) {
    try {
        // Security: Check for a secret key (optional but recommended)
        const { searchParams } = new URL(req.url)
        const secret = searchParams.get("secret")
        const CRON_SECRET = process.env.CRON_SECRET || "arthastra-secret-cron-key"

        if (secret !== CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // Find users who:
        // 1. Have NOT completed onboarding (step < 5)
        // 2. Were last active MORE than 24 hours ago
        // 3. Do NOT have a 'drop_off' alert in the last 48 hours (to avoid spam)
        const potentialDropoffs = await User.find({
            onboardingStep: { $lt: 5 },
            lastActiveAt: { $lt: twentyFourHoursAgo },
            phone: { $exists: true, $ne: "" }
        }).limit(50) // Process in batches

        const results = []

        for (const user of potentialDropoffs) {
            // Check existing alert
            const recentAlert = await Alert.findOne({
                userId: user._id,
                type: "drop_off",
                createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
            })

            if (recentAlert) continue

            // Create Alert
            const stepNames = ["", "Basic Profile", "Employment Details", "Financial Info", "Loan Requirements", "Enhancements"]
            const stoppedAt = stepNames[user.onboardingStep] || `Step ${user.onboardingStep}`

            await Alert.create({
                userId: user._id,
                type: "drop_off",
                title: "Resume Your Application 🚀",
                message: `Hi ${user.name}, you stopped at ${stoppedAt}. Finish now to see your offers!`,
                severity: "warning",
                metadata: { stoppedStep: user.onboardingStep, source: "cron" }
            })

            // Send WhatsApp
            let waStatus = "skipped"
            if (user.phone) {
                try {
                    const res = await sendWhatsAppMessage(user.phone, `Hi ${user.name || "there"}! 👋 You stopped your loan application at *${stoppedAt}*. \n\nResume now to unlock personalized offers! 🚀\n\n👉 https://arthastra.vercel.app/onboarding`)
                    waStatus = res.success ? "sent" : "failed"
                } catch (e) {
                    waStatus = "error"
                }
            }

            results.push({ userId: user._id, name: user.name, status: waStatus })
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        })

    } catch (error: any) {
        console.error("[Cron Error]", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
