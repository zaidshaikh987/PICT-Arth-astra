import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Alert } from "@/lib/models/alert"

// POST /api/alerts/generate — Analyze user data and create alerts
export async function POST() {
    try {
        await connectDB()
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const user = await User.findById(userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const newAlerts: any[] = []

        // ─── 1. Credit Score Change Detection ───
        const history = user.creditScoreHistory || []
        if (history.length >= 2) {
            const latest = history[history.length - 1]
            const previous = history[history.length - 2]
            const delta = latest.score - previous.score

            // Only alert if we haven't already alerted for this specific change
            const existingAlert = await Alert.findOne({
                userId,
                type: "credit_score_change",
                "metadata.latestDate": latest.date,
            })

            if (!existingAlert && delta !== 0) {
                const isPositive = delta > 0
                newAlerts.push({
                    userId,
                    type: "credit_score_change",
                    title: isPositive
                        ? `Credit Score Improved by ${delta} points! 🎉`
                        : `Credit Score Dropped by ${Math.abs(delta)} points ⚠️`,
                    message: isPositive
                        ? `Your score rose from ${previous.score} to ${latest.score}. Keep up the good financial habits!`
                        : `Your score dropped from ${previous.score} to ${latest.score}. Consider reducing credit utilization and paying bills on time.`,
                    severity: isPositive ? "info" : delta < -20 ? "critical" : "warning",
                    metadata: { delta, from: previous.score, to: latest.score, latestDate: latest.date },
                })
            }
        }

        // ... existing imports ...
        const { sendWhatsAppMessage } = await import("@/lib/notifications")

        // ─── 2. Application Drop-off Detection ───
        if (user.onboardingStep < 5) {
            const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0
            const hoursSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60)

            if (hoursSinceActive > 24) {
                // Check if we already sent a drop-off alert in last 48 hours
                const recentDropoff = await Alert.findOne({
                    userId,
                    type: "drop_off",
                    createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
                })

                if (!recentDropoff) {
                    const stepNames = ["", "Basic Profile", "Employment Details", "Financial Info", "Loan Requirements", "Enhancements"]
                    const stoppedAt = stepNames[user.onboardingStep] || `Step ${user.onboardingStep}`

                    const message = `You stopped at "${stoppedAt}". Complete your application now to get personalized loan offers up to ₹${((user.monthlyIncome || 30000) * 60).toLocaleString("en-IN")}!`

                    newAlerts.push({
                        userId,
                        type: "drop_off",
                        title: "Complete Your Application 📋",
                        message,
                        severity: "warning",
                        metadata: { stoppedStep: user.onboardingStep, hoursSinceActive: Math.round(hoursSinceActive) },
                    })

                    // 🚀 TRIGGER WHATSAPP: Re-engagement Nudge
                    if (user.phone) {
                        try {
                            await sendWhatsAppMessage(user.phone, `Hi ${user.name || "there"}! We noticed you stopped your loan application at *${stoppedAt}*. 📋\n\nComplete it now to unlock offers up to ₹${((user.monthlyIncome || 30000) * 60).toLocaleString("en-IN")}!\n\n👉 Click here to resume: https://arthastra.vercel.app/onboarding`)
                        } catch (e) {
                            console.error("Failed to send drop-off WhatsApp", e)
                        }
                    }
                }
            }
        }

        // ... (EMI Logic is fine without WhatsApp for now, or add if critical) ...

        // Insert all new alerts
        if (newAlerts.length > 0) {
            await Alert.insertMany(newAlerts)

            // Check for critical credit score drop in newAlerts and send WhatsApp
            const criticalCreditAlert = newAlerts.find(a => a.type === "credit_score_change" && a.severity === "critical")
            if (criticalCreditAlert && user.phone) {
                try {
                    await sendWhatsAppMessage(user.phone, `⚠️ Vital Alert: Your credit score dropped by ${Math.abs(criticalCreditAlert.metadata.delta)} points. Login to ArthAstra to view the detailed report immediately.`)
                } catch (e) {
                    console.error("Failed to send credit alert WhatsApp", e)
                }
            }
        }

        return NextResponse.json({ generated: newAlerts.length, alerts: newAlerts })
    } catch (error: any) {
        console.error("[Alert Generate Error]", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
