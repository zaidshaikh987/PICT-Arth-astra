export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"

export async function POST(req: Request) {
    try {
        await connectDB()
        const { phone } = await req.json()

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
        }

        const cleanPhone = phone.replace(/\D/g, "")
        const user = await User.findOne({ phone: cleanPhone })

        if (!user) {
            return NextResponse.json({ error: "No account found. Please Sign Up first." }, { status: 404 })
        }

        // Update session timestamp
        user.sessionTs = Date.now()
        await user.save()

        const response = NextResponse.json({
            success: true,
            userId: user._id.toString(),
            user: user.toObject(),
        })

        // Set userId cookie
        response.cookies.set("userId", user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        })

        return response
    } catch (error: any) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}
