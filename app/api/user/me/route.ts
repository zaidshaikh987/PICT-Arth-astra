import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        await connectDB()
        const user = await User.findById(userId).lean()

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error: any) {
        console.error("Get user error:", error)
        return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
    }
}
