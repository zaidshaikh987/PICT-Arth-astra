import { calculateEMI } from "./calculator"

export function calculateDetailedEligibility(data: any) {
    // Extract user data with proper defaults
    const monthlyIncome = Number(data.monthlyIncome) || 30000
    const existingEMI = Number(data.existingEMI) || 0
    const monthlyExpenses = Number(data.monthlyExpenses) || Math.round(monthlyIncome * 0.3)
    const loanAmount = Number(data.loanAmount) || 500000
    const tenure = Number(data.tenure) || 3
    const creditScore = Number(data.creditScore) || 650
    const hasCreditHistory = data.hasCreditHistory ?? true
    const coborrowerIncome = data.isJointApplication ? Number(data.coborrowerIncome) || 0 : 0
    const employmentType = data.employmentType || "salaried"
    const employmentTenure = data.employmentTenure || "1-2yr"

    const totalIncome = monthlyIncome + coborrowerIncome

    // Banking-standard DTI (FOIR): Only debt obligations, NOT living expenses
    // This matches how banks actually evaluate loan applications
    const dti = totalIncome > 0 ? (existingEMI / totalIncome) * 100 : 0

    // Total obligation ratio (includes expenses) — used for capacity calculation
    const totalObligationRatio = totalIncome > 0 ? ((existingEMI + monthlyExpenses) / totalIncome) * 100 : 0

    // Banks typically allow 40-50% of net income for EMI
    // Subtract existing EMI AND expenses from capacity
    const maxEMICapacity = totalIncome * 0.5 - existingEMI
    const availableForEMI = Math.max(0, maxEMICapacity)

    let baseRate = 12.0 // Base rate for average credit
    if (creditScore >= 800) baseRate = 9.5
    else if (creditScore >= 750) baseRate = 10.5
    else if (creditScore >= 700) baseRate = 11.5
    else if (creditScore >= 650) baseRate = 12.5
    else baseRate = 14.0

    // Adjust for employment type
    if (employmentType === "self_employed") baseRate += 0.5
    if (employmentType === "freelancer") baseRate += 1.0

    // Using reverse EMI formula: P = EMI * [(1+r)^n - 1] / [r * (1+r)^n]
    const monthlyRate = baseRate / 12 / 100
    const months = tenure * 12
    const factor = Math.pow(1 + monthlyRate, months)

    let maxEligibleAmount = 0
    if (availableForEMI > 0 && monthlyRate > 0) {
        maxEligibleAmount = availableForEMI * ((factor - 1) / (monthlyRate * factor))
    }

    // Apply credit score multiplier
    let creditMultiplier = 1.0
    if (!hasCreditHistory) creditMultiplier = 0.6
    else if (creditScore >= 750) creditMultiplier = 1.2
    else if (creditScore >= 700) creditMultiplier = 1.0
    else if (creditScore >= 650) creditMultiplier = 0.85
    else creditMultiplier = 0.7

    // Apply employment tenure factor
    let tenureMultiplier = 1.0
    if (employmentTenure === "<6_months") tenureMultiplier = 0.7
    else if (employmentTenure === "6m-1yr") tenureMultiplier = 0.85
    else if (employmentTenure === "1-2yr") tenureMultiplier = 0.95
    else if (employmentTenure === "2-5yr") tenureMultiplier = 1.0
    else tenureMultiplier = 1.1

    maxEligibleAmount = Math.floor(maxEligibleAmount * creditMultiplier * tenureMultiplier)

    // Cap at reasonable limits
    maxEligibleAmount = Math.min(maxEligibleAmount, totalIncome * 60) // Max 60x monthly income
    maxEligibleAmount = Math.max(maxEligibleAmount, 50000) // Minimum 50k

    const estimatedEMI = calculateEMI(maxEligibleAmount, baseRate, months)

    // Calculate eligibility factors
    const factors = [
        {
            name: "Income Level",
            score: Math.min(100, Math.round((monthlyIncome / 100000) * 100)),
            status: monthlyIncome >= 25000 ? "pass" : monthlyIncome >= 15000 ? "warning" : "fail",
            description:
                monthlyIncome >= 25000
                    ? `₹${monthlyIncome.toLocaleString("en-IN")}/month - Meets requirements`
                    : `₹${monthlyIncome.toLocaleString("en-IN")}/month - Below ₹25,000 threshold`,
        },
        {
            name: "Debt-to-Income Ratio",
            score: Math.max(0, Math.round(100 - dti * 1.5)),
            status: dti <= 40 ? "pass" : dti <= 50 ? "warning" : "fail",
            description: `${dti.toFixed(1)}% of income goes to obligations. ${dti <= 40 ? "Healthy ratio" : "Consider reducing debt"}`,
        },
        {
            name: "Credit Score",
            score: hasCreditHistory ? Math.round((creditScore - 300) / 6) : 40,
            status: !hasCreditHistory ? "warning" : creditScore >= 750 ? "pass" : creditScore >= 650 ? "warning" : "fail",
            description: hasCreditHistory
                ? `CIBIL Score: ${creditScore} - ${creditScore >= 750 ? "Excellent" : creditScore >= 700 ? "Good" : creditScore >= 650 ? "Fair" : "Needs improvement"}`
                : "No credit history found - Building credit recommended",
        },
        {
            name: "Employment Stability",
            score:
                employmentType === "salaried"
                    ? employmentTenure === "5+yr"
                        ? 100
                        : employmentTenure === "2-5yr"
                            ? 90
                            : 75
                    : 65,
            status: employmentTenure === "<6_months" ? "warning" : "pass",
            description: `${employmentType === "salaried" ? "Salaried" : employmentType === "self_employed" ? "Self-employed" : "Freelancer"} - ${employmentTenure || "1-2yr"} tenure`,
        },
    ]

    // Calculate overall approval odds
    const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length
    let approvalOdds = Math.round(avgScore * 0.85)

    // Adjust for specific factors
    if (dti > 50) approvalOdds -= 15
    if (!hasCreditHistory) approvalOdds -= 10
    if (creditScore < 650 && hasCreditHistory) approvalOdds -= 10
    if (coborrowerIncome > 0) approvalOdds += 10

    approvalOdds = Math.min(95, Math.max(15, approvalOdds))

    // Determine overall status
    let overallStatus = "approved"
    if (dti > 60 || monthlyIncome < 15000) overallStatus = "rejected"
    else if (dti > 50 || !hasCreditHistory || creditScore < 650) overallStatus = "review"

    // Generate recommendations
    const recommendations = []

    if (dti > 40) {
        recommendations.push({
            title: "Reduce Existing Debt",
            description: `Your DTI is ${dti.toFixed(1)}%. Paying off ₹${Math.round(existingEMI * 0.3).toLocaleString("en-IN")} in existing loans could increase eligibility by 20%.`,
            impact: "high",
        })
    }

    if (!hasCreditHistory || creditScore < 750) {
        recommendations.push({
            title: "Improve Credit Score",
            description:
                creditScore < 700
                    ? "A score above 750 can reduce your interest rate by 2-3% and increase loan amount."
                    : "Your score is good. Maintaining it above 750 ensures best rates.",
            impact: "high",
        })
    }

    if (!data.isJointApplication && totalIncome < 50000) {
        recommendations.push({
            title: "Consider Joint Application",
            description: "Adding a co-applicant can increase your eligible amount by 40-60% and improve approval chances.",
            impact: "high",
        })
    }

    if (tenure < 5) {
        recommendations.push({
            title: "Extend Loan Tenure",
            description: `Increasing tenure from ${tenure} to ${Math.min(tenure + 2, 7)} years reduces EMI by ~${Math.round(((tenure + 2) / tenure - 1) * 30)}% making larger loans affordable.`,
            impact: "medium",
        })
    }

    recommendations.push({
        title: "Maintain Stable Employment",
        description: "2+ years in current job and consistent income deposits strengthen your application significantly.",
        impact: "medium",
    })

    return {
        overallStatus,
        statusMessage:
            overallStatus === "approved"
                ? "You meet all eligibility criteria for the requested loan"
                : overallStatus === "review"
                    ? "Your application needs additional review. Consider the recommendations below."
                    : "Current profile doesn't meet minimum requirements. Follow recommendations to improve.",
        maxAmount: maxEligibleAmount,
        requestedAmount: loanAmount,
        approvalOdds,
        factors,
        financials: {
            monthlyIncome,
            existingEMI,
            monthlyExpenses,
            availableForEMI: Math.round(availableForEMI),
            dti: Math.round(dti * 10) / 10,
            totalObligationRatio: Math.round(totalObligationRatio * 10) / 10,
            estimatedEMI: Math.round(estimatedEMI),
            interestRate: baseRate,
            tenure,
        },
        recommendations,
    }
}
