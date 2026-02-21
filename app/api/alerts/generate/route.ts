import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Alert } from "@/lib/models/alert"
import { sendWhatsAppMessage } from "@/lib/notifications"

export async function POST() {
    try {
        await connectDB()
        console.log("🚀 Running Alert Engine...")

        const users = await User.find({})
        let alertsCreated = 0
        let whatsappSent = 0

        for (const user of users) {
            // 1. Drop-off Detection (Inactive > 24h & Incomplete Onboarding)
            const hoursSinceLastActive = (Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60)

            if (user.onboardingStep < 5 && hoursSinceLastActive > 24) {
                // Check if we already sent a drop-off alert recently
                const existingAlert = await Alert.findOne({
                    userId: user._id,
                    type: "drop_off",
                    createdAt: { $gt: new Date(Date.now() - 48 * 60 * 60 * 1000) } // Within last 48h
                })

                if (!existingAlert) {
                    const onboardingSteps = ["Profile", "Employment", "Financials", "Loan Goals", "Verification", "Complete"]
                    const currentStepName = onboardingSteps[user.onboardingStep] || "Onboarding"

                    const message = `Hi ${user.name || "there"}! You were so close to checking your loan eligibility. You stopped at the ${currentStepName} step. Come back and finish now: https://arth-astra.vercel.app/onboarding`

                    await Promise.all([
                        Alert.create({
                            userId: user._id,
                            type: "drop_off",
                            title: "Continue your application 📝",
                            message: `Resume your ${currentStepName} step to see your customized loan offers.`,
                            severity: "info"
                        }),
                        sendWhatsAppMessage(user.phone, message)
                    ])
                    alertsCreated++
                    whatsappSent++
                }
            }

            // 2. EMI Reminders
            if (user.emiSchedule && user.emiSchedule.length > 0) {
                for (const emi of user.emiSchedule) {
                    const daysToDue = (new Date(emi.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)

                    if (!emi.paid && daysToDue > 0 && daysToDue <= 3) {
                        const existingEMIAlert = await Alert.findOne({
                            userId: user._id,
                            type: "emi_reminder",
                            message: { $regex: emi.loanName }
                        })

                        if (!existingEMIAlert) {
                            await Alert.create({
                                userId: user._id,
                                type: "emi_reminder",
                                title: "Upcoming EMI Due 💰",
                                message: `Your EMI of ₹${emi.amount} for ${emi.loanName} is due on ${new Date(emi.dueDate).toLocaleDateString()}.`,
                                severity: daysToDue <= 1 ? "critical" : "warning"
                            })
                            alertsCreated++
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            alertsCreated,
            whatsappSent,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error("Alert generation error:", error)
        return NextResponse.json({ error: "Failed to generate alerts" }, { status: 500 })
    }
}
