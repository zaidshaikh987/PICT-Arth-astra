export function simulateOptimization(userData: any, sim: any) {
    const currentIncome = userData.monthlyIncome || 30000
    const currentEMI = userData.existingEMI || 0
    const currentScore = userData.creditScore || 650
    const tenure = userData.tenure || 3

    // Current calculations
    const currentDTI = (currentEMI / currentIncome) * 100
    const currentAvailable = currentIncome - currentEMI
    let currentMax = currentAvailable * 60 * tenure
    if (currentScore >= 750) currentMax *= 1.15

    // Projected calculations
    const projectedIncome = currentIncome + sim.increaseIncome + (sim.jointApplication ? 40000 : 0)
    const paidOffDebt = Math.min(sim.payOffDebt, currentEMI * 12)
    const reducedEMI = Math.max(0, currentEMI - paidOffDebt / 12)
    const projectedScore = Math.min(850, currentScore + sim.improveScore)

    const projectedDTI = (reducedEMI / projectedIncome) * 100
    const projectedAvailable = projectedIncome - reducedEMI
    let projectedMax = projectedAvailable * 60 * tenure

    if (projectedScore >= 750) projectedMax *= 1.15
    if (sim.waitMonths >= 6) projectedMax *= 1.05

    const improvement = {
        amount: Math.floor(projectedMax - currentMax),
        percentage: ((projectedMax - currentMax) / currentMax) * 100,
    }

    const impacts = [
        {
            factor: "Debt Reduction",
            change: sim.payOffDebt > 0 ? Math.min(20, (sim.payOffDebt / 100000) * 10) : 0,
            description:
                sim.payOffDebt > 0 ? `Improves DTI from ${currentDTI.toFixed(0)}% to ${projectedDTI.toFixed(0)}%` : "No change",
        },
        {
            factor: "Income Growth",
            change: sim.increaseIncome > 0 ? Math.min(25, (sim.increaseIncome / 10000) * 5) : 0,
            description:
                sim.increaseIncome > 0
                    ? `Increases available income by ₹${sim.increaseIncome.toLocaleString("en-IN")}`
                    : "No change",
        },
        {
            factor: "Credit Score",
            change: sim.improveScore > 0 ? Math.min(15, sim.improveScore / 5) : 0,
            description: sim.improveScore > 0 ? `Boosts score from ${currentScore} to ${projectedScore}` : "No change",
        },
        {
            factor: "Joint Application",
            change: sim.jointApplication ? 30 : 0,
            description: sim.jointApplication ? "Combines household income" : "Single applicant",
        },
    ]

    const aiRecommendation = generateRecommendation(sim, impacts)
    const timeline = calculateTimeline(sim)

    return {
        current: {
            maxAmount: Math.floor(currentMax),
            approvalOdds: Math.min(85, 60 + (currentScore - 600) / 10),
        },
        projected: {
            maxAmount: Math.floor(projectedMax),
            approvalOdds: Math.min(95, 60 + (projectedScore - 600) / 10 + (sim.jointApplication ? 10 : 0)),
        },
        improvement,
        impacts: impacts.filter((i) => i.change > 0),
        aiRecommendation,
        timeline,
    }
}

function generateRecommendation(sim: any, impacts: any[]) {
    const maxImpact = impacts.reduce((max, i) => (i.change > max.change ? i : max), impacts[0])

    if (sim.jointApplication) {
        return "Adding a joint applicant has the highest impact. Consider applying with a spouse or family member with stable income."
    } else if (maxImpact?.factor === "Debt Reduction") {
        return "Focus on paying off existing high-interest loans first. This will significantly improve your DTI ratio and eligibility."
    } else if (maxImpact?.factor === "Income Growth") {
        return "Negotiate a raise or consider additional income sources. Higher income directly increases your loan eligibility."
    } else if (maxImpact?.factor === "Credit Score") {
        return "Work on building your credit score by paying bills on time and using credit responsibly for the next few months."
    }
    return "Consider a combination of strategies for maximum impact on your loan eligibility."
}

function calculateTimeline(sim: any) {
    let months = sim.waitMonths
    if (sim.improveScore > 0) months = Math.max(months, 3)
    if (sim.payOffDebt > 50000) months = Math.max(months, 6)
    if (sim.jointApplication) months = Math.max(months, 1)

    if (months === 0) return "Immediate"
    if (months <= 3) return "1-3 months"
    if (months <= 6) return "3-6 months"
    return "6-12 months"
}
