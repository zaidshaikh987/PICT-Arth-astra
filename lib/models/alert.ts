import mongoose, { Schema, type Document } from "mongoose"

export interface IAlert extends Document {
    userId: mongoose.Types.ObjectId
    type: "credit_score_change" | "drop_off" | "emi_reminder" | "spending_insight" | "system"
    title: string
    message: string
    severity: "info" | "warning" | "critical"
    read: boolean
    metadata: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

const AlertSchema = new Schema<IAlert>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["credit_score_change", "drop_off", "emi_reminder", "spending_insight", "system"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        severity: {
            type: String,
            enum: ["info", "warning", "critical"],
            default: "info",
        },
        read: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
)

// Index for efficient queries: unread alerts for a user, sorted by date
AlertSchema.index({ userId: 1, read: 1, createdAt: -1 })

export const Alert = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema)
