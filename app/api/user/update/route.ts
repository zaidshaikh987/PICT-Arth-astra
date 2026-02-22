export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/user"

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        await connectDB()
        const updates = await req.json()

        // Remove immutable fields
        delete updates._id
        delete updates.phone
        delete updates.createdAt

        const user = await User.findByIdAndUpdate(userId, { $set: { ...updates, lastActiveAt: new Date() } }, { new: true }).lean()

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        console.error("Update error:", error)
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}
