import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local")
}

/* Cache the connection across hot-reloads in development */
const cached = (global as any).mongoose || { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn) return cached.conn
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
    }
    cached.conn = await cached.promise
        ; (global as any).mongoose = cached
    return cached.conn
}
