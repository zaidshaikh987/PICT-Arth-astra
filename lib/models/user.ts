import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
    // Basic Profile (Step 1)
    name: string
    age: number
    phone: string
    city: string
    state: string
    language: string

    // Employment (Step 2)
    employmentType: string
    monthlyIncome: number
    employmentTenure: string
    companyName: string

    // Financial (Step 3)
    existingEMI: number
    monthlyExpenses: number
    savingsRange: string
    hasCreditHistory: boolean
    creditScore: number

    // Loan Requirement (Step 4)
    loanPurpose: string
    loanAmount: number
    preferredEMI: number
    tenure: number

    // Enhancements (Step 5)
    isJointApplication: boolean
    coborrowerIncome: number
    coborrowerRelationship: string

    // App state
    onboardingStep: number
    uploadedFiles: any[]
    timelineSimulation: Record<string, any>
    loanGoals: any[]
    selectedLoan: Record<string, any> | null
    sessionTs: number

    // Fintech alert data
    creditScoreHistory: { score: number; date: Date }[]
    emiSchedule: { amount: number; dueDate: Date; loanName: string; paid: boolean }[]
    spendingCategories: { travel: number; food: number; shopping: number; bills: number; other: number }
    lastActiveAt: Date

    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        // Basic Profile
        name: { type: String, default: "" },
        age: { type: Number, default: 0 },
        phone: { type: String, required: true, unique: true },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        language: { type: String, default: "en" },

        // Employment
        employmentType: { type: String, default: "" },
        monthlyIncome: { type: Number, default: 0 },
        employmentTenure: { type: String, default: "" },
        companyName: { type: String, default: "" },

        // Financial
        existingEMI: { type: Number, default: 0 },
        monthlyExpenses: { type: Number, default: 0 },
        savingsRange: { type: String, default: "" },
        hasCreditHistory: { type: Boolean, default: false },
        creditScore: { type: Number, default: 0 },

        // Loan Requirement
        loanPurpose: { type: String, default: "" },
        loanAmount: { type: Number, default: 0 },
        preferredEMI: { type: Number, default: 0 },
        tenure: { type: Number, default: 0 },

        // Enhancements
        isJointApplication: { type: Boolean, default: false },
        coborrowerIncome: { type: Number, default: 0 },
        coborrowerRelationship: { type: String, default: "" },

        // App state
        onboardingStep: { type: Number, default: 0 },
        uploadedFiles: { type: Schema.Types.Mixed, default: [] },
        timelineSimulation: { type: Schema.Types.Mixed, default: {} },
        loanGoals: { type: Schema.Types.Mixed, default: [] },
        selectedLoan: { type: Schema.Types.Mixed, default: null },
        sessionTs: { type: Number, default: 0 },

        // Fintech alert data
        creditScoreHistory: { type: [{ score: Number, date: Date }], default: [] },
        emiSchedule: { type: [{ amount: Number, dueDate: Date, loanName: String, paid: Boolean }], default: [] },
        spendingCategories: {
            type: Schema.Types.Mixed,
            default: { travel: 0, food: 0, shopping: 0, bills: 0, other: 0 },
        },
        lastActiveAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
