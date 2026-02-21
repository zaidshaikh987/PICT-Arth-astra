"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface UserData {
    _id?: string
    name?: string
    age?: number
    phone?: string
    city?: string
    state?: string
    language?: string
    employmentType?: string
    monthlyIncome?: number
    employmentTenure?: string
    companyName?: string
    existingEMI?: number
    monthlyExpenses?: number
    savingsRange?: string
    hasCreditHistory?: boolean
    creditScore?: number
    loanPurpose?: string
    loanAmount?: number
    preferredEMI?: number
    tenure?: number
    isJointApplication?: boolean
    coborrowerIncome?: number
    coborrowerRelationship?: string
    onboardingStep?: number
    uploadedFiles?: any[]
    timelineSimulation?: Record<string, any>
    loanGoals?: any[]
    selectedLoan?: Record<string, any> | null
    sessionTs?: number
    createdAt?: string
    updatedAt?: string
    savedScenarios?: any[]
    creditReadinessScore?: number
    applicationStatus?: "pending" | "approved" | "rejected" | "more_info"
    xp?: number
    badges?: string[]
}

interface UserContextType {
    user: UserData | null
    loading: boolean
    error: string | null
    refreshUser: () => Promise<void>
    updateUser: (updates: Partial<UserData>) => Promise<void>
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    error: null,
    refreshUser: async () => { },
    updateUser: async () => { },
})

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshUser = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/user/me")
            if (res.status === 401) {
                setUser(null)
                setError(null)
                return
            }
            if (!res.ok) throw new Error("Failed to fetch user")
            const data = await res.json()
            setUser(data.user)
            setError(null)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateUser = useCallback(async (updates: Partial<UserData>) => {
        try {
            const res = await fetch("/api/user/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            })
            if (!res.ok) throw new Error("Update failed")
            const data = await res.json()
            setUser(data.user)
        } catch (e: any) {
            console.error("Update error:", e)
            throw e
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, updateUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}
