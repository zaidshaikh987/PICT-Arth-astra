import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import { Alert } from "@/lib/models/alert"

// GET /api/alerts — Fetch alerts for the current user
export async function GET() {
    try {
        await connectDB()
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const alerts = await Alert.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        const unreadCount = await Alert.countDocuments({ userId, read: false })

        return NextResponse.json({ alerts, unreadCount })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT /api/alerts — Mark alert(s) as read
export async function PUT(req: Request) {
    try {
        await connectDB()
        const cookieStore = await cookies()
        const userId = cookieStore.get("userId")?.value
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const { alertId, markAll } = await req.json()

        if (markAll) {
            await Alert.updateMany({ userId, read: false }, { $set: { read: true } })
        } else if (alertId) {
            await Alert.updateOne({ _id: alertId, userId }, { $set: { read: true } })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
