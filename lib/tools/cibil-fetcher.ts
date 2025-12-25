export type CibilReport = {
    reportId: string
    score: number
    scoreBand: "Excellent" | "Good" | "Fair" | "Poor"
    summary: string
    factors: string[]
    lastUpdated: string
}

export function fetchUserCIBIL(userData: any): { success: boolean, data?: CibilReport, error?: string } {
    // In a real app, this would call a CIBIL API using PAN
    // Here, we "fetch" it from the secure profile data we (Agent) have access to.

    // 1. Validate permissions (Mock)
    if (!userData) {
        return { success: false, error: "ACCESS_DENIED: No user profile linked." }
    }

    // 2. "Fetch" data (Simulated network call)
    const score = Number(userData.creditScore) || 0
    const history = userData.hasCreditHistory ?? false

    // 3. Generate Bureau Report
    if (score === 0 && !history) {
        return {
            success: true,
            data: {
                reportId: `CIBIL-${Math.floor(Math.random() * 100000)}`,
                score: -1, // No score code
                scoreBand: "Poor",
                summary: "No Credit History Found (NH)",
                factors: ["No active loans", "No credit cards"],
                lastUpdated: new Date().toISOString().split('T')[0]
            }
        }
    }

    let band: CibilReport["scoreBand"] = "Poor"
    if (score >= 750) band = "Excellent"
    else if (score >= 700) band = "Good"
    else if (score >= 650) band = "Fair"

    return {
        success: true,
        data: {
            reportId: `CIBIL-${Math.floor(Math.random() * 100000)}`,
            score: score,
            scoreBand: band,
            summary: `Active credit profile found with score ${score}`,
            factors: [
                "Payment history verified",
                userData.existingEMI > 0 ? "Active loans present" : "No active loans detected"
            ],
            lastUpdated: new Date().toISOString().split('T')[0]
        }
    }
}
