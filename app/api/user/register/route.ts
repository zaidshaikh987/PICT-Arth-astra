export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"
import { Alert } from "@/lib/models/alert"

export async function POST(req: Request) {
    try {
        await connectDB()
        const body = await req.json()

        if (!body.phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
        }

        const cleanPhone = body.phone.replace(/\D/g, "")

        // Check if user already exists
        const existingUser = await User.findOne({ phone: cleanPhone })
        if (existingUser) {
            return NextResponse.json({
                error: "User already exists",
                code: "USER_EXISTS"
            }, { status: 409 })
        }

        const creditScore = body.creditScore || 650
        const monthlyIncome = body.monthlyIncome || 30000
        const monthlyExpenses = body.monthlyExpenses || Math.round(monthlyIncome * 0.3)
        const loanAmount = body.loanAmount || 500000
        const tenure = body.tenure || 3

        // Generate 6-month credit score history with realistic fluctuations
        const creditScoreHistory = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const fluctuation = Math.floor(Math.random() * 30) - 10 // -10 to +20
            creditScoreHistory.push({
                score: Math.max(300, Math.min(900, creditScore + fluctuation - (i * 5))),
                date: d,
            })
        }

        // Generate 3 upcoming EMI entries
        const monthlyRate = 0.01
        const months = tenure * 12
        const factor = Math.pow(1 + monthlyRate, months)
        const emi = Math.round((loanAmount * monthlyRate * factor) / (factor - 1))

        const emiSchedule = []
        for (let i = 1; i <= 3; i++) {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + i * 2) // Due in 2, 4, 6 days
            emiSchedule.push({
                amount: emi,
                dueDate,
                loanName: i === 1 ? "Home Loan" : i === 2 ? "Personal Loan" : "Car Loan",
                paid: false,
            })
        }

        // Spending breakdown from monthly expenses
        const spendingCategories = {
            travel: Math.round(monthlyExpenses * 0.15),
            food: Math.round(monthlyExpenses * 0.30),
            shopping: Math.round(monthlyExpenses * 0.20),
            bills: Math.round(monthlyExpenses * 0.25),
            other: Math.round(monthlyExpenses * 0.10),
        }

        // Create new user
        const user = await User.create({
            name: body.name || "",
            age: body.age || 0,
            phone: cleanPhone,
            city: body.city || "",
            state: body.state || "",
            language: body.language || "en",
            employmentType: body.employmentType || "",
            monthlyIncome,
            employmentTenure: body.employmentTenure || "",
            companyName: body.companyName || "",
            existingEMI: body.existingEMI || 0,
            monthlyExpenses,
            savingsRange: body.savingsRange || "",
            hasCreditHistory: body.hasCreditHistory || false,
            creditScore,
            loanPurpose: body.loanPurpose || "",
            loanAmount,
            preferredEMI: body.preferredEMI || 0,
            tenure,
            isJointApplication: body.isJointApplication || false,
            coborrowerIncome: body.coborrowerIncome || 0,
            coborrowerRelationship: body.coborrowerRelationship || "",
            onboardingStep: body.onboardingStep || 5,
            sessionTs: Date.now(),
            creditScoreHistory,
            emiSchedule,
            spendingCategories,
            lastActiveAt: new Date(),
        })

        // Create welcome alerts for new user
        await Alert.insertMany([
            {
                userId: user._id,
                type: "system",
                title: "Welcome to ArthAstra! 🎉",
                message: `Hi ${body.name || "there"}! Your profile is set up. Explore your dashboard to check loan eligibility, compare offers, and track your credit score.`,
                severity: "info",
            },
            {
                userId: user._id,
                type: "credit_score_change",
                title: `Credit Score: ${creditScore} — ${creditScore >= 750 ? "Excellent" : creditScore >= 650 ? "Good" : "Needs Improvement"}`,
                message: `Your initial credit score is ${creditScore}. We'll track changes and alert you instantly whenever it moves.`,
                severity: creditScore >= 750 ? "info" : creditScore >= 650 ? "info" : "warning",
                metadata: { score: creditScore },
            },
        ])

        const response = NextResponse.json({
            success: true,
            userId: user._id.toString(),
        })

        // Set userId cookie for session
        response.cookies.set("userId", user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        })

        return response
    } catch (error: any) {
        console.error("Register error:", error)
        return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }
}
