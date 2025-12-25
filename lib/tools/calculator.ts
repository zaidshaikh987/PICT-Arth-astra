export type LoanOffer = {
    bankName: string
    productName: string
    baseRate: number
    processingFeePercent: number
    processingTime: number
    approvalBonus: number
    category: string
    isRecommended?: boolean
    features: string[]
    // Calculated fields
    rate?: number
    tenure?: number
    emi?: number
    principal?: number
    totalInterest?: number
    totalCost?: number
    processingFee?: number
    approvalOdds?: number
}

// Deterministic EMI calculation
export function calculateEMI(principal: number, annualRate: number, months: number): number {
    if (principal <= 0 || months <= 0) return 0
    const monthlyRate = annualRate / 12 / 100
    if (monthlyRate === 0) return Math.round(principal / months)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(emi)
}

// Logic to generate offers based on user profile
export function generateLoanOffers(userData: any): LoanOffer[] {
    const amount = Number(userData.loanAmount) || 500000
    const tenure = Number(userData.tenure) || 3
    const creditScore = Number(userData.creditScore) || 650
    const hasCreditHistory = userData.hasCreditHistory ?? true
    const employmentType = userData.employmentType || "salaried"

    // Base rates adjusted by credit score
    let rateAdjustment = 0
    if (!hasCreditHistory) rateAdjustment = 2.0
    else if (creditScore >= 800) rateAdjustment = -1.5
    else if (creditScore >= 750) rateAdjustment = -0.75
    else if (creditScore >= 700) rateAdjustment = 0
    else if (creditScore >= 650) rateAdjustment = 0.5
    else rateAdjustment = 1.5

    if (employmentType === "self_employed") rateAdjustment += 0.5
    if (employmentType === "freelancer") rateAdjustment += 1.0

    // Approval odds based on profile
    let baseApproval = 70
    if (creditScore >= 750) baseApproval = 85
    else if (creditScore >= 700) baseApproval = 78
    else if (creditScore >= 650) baseApproval = 68
    else baseApproval = 55

    if (!hasCreditHistory) baseApproval -= 15

    const offers: LoanOffer[] = [
        {
            bankName: "HDFC Bank",
            productName: "Personal Loan - Premium",
            baseRate: 10.5,
            processingFeePercent: 1.5,
            processingTime: 2,
            approvalBonus: 5,
            category: "recommended",
            isRecommended: true,
            features: [
                "Zero prepayment charges after 12 months",
                "Instant disbursal to account",
                "Flexible tenure 1-7 years",
                "No collateral required",
            ],
        },
        {
            bankName: "ICICI Bank",
            productName: "Express Personal Loan",
            baseRate: 10.75,
            processingFeePercent: 2.0,
            processingTime: 3,
            approvalBonus: 3,
            category: "recommended",
            features: ["Quick 24-hour approval", "100% digital process", "Minimal documentation", "Balance transfer option"],
        },
        {
            bankName: "Axis Bank",
            productName: "Quick Personal Loan",
            baseRate: 11.0,
            processingFeePercent: 1.75,
            processingTime: 3,
            approvalBonus: 2,
            category: "budget",
            features: ["No income proof for existing customers", "Part-prepayment allowed", "Doorstep service available"],
        },
        {
            bankName: "Kotak Mahindra Bank",
            productName: "SuperCash Loan",
            baseRate: 10.25,
            processingFeePercent: 2.5,
            processingTime: 4,
            approvalBonus: -2,
            category: "premium",
            features: ["Lowest interest rates", "Premium customer support", "Relationship benefits", "Top-up loan facility"],
        },
        {
            bankName: "SBI",
            productName: "Xpress Credit",
            baseRate: 11.15,
            processingFeePercent: 1.0,
            processingTime: 5,
            approvalBonus: 4,
            category: "budget",
            features: ["Lowest processing fee", "Trusted public sector bank", "Wide branch network", "Simple documentation"],
        },
        {
            bankName: "Bajaj Finserv",
            productName: "Personal Loan",
            baseRate: 11.5,
            processingFeePercent: 2.0,
            processingTime: 1,
            approvalBonus: 0,
            category: "budget",
            features: ["Same day disbursal", "Flexi loan option", "No foreclosure charges", "EMI holiday option"],
        },
    ]

    return offers
        .map((offer) => {
            const rate = Math.max(8.5, Math.min(18, offer.baseRate + rateAdjustment))
            const approvalOdds = Math.min(95, Math.max(30, baseApproval + offer.approvalBonus))

            const monthlyRate = rate / 12 / 100
            const months = tenure * 12
            const emi = calculateEMI(amount, rate, months)

            const totalCost = emi * months
            const totalInterest = totalCost - amount
            const processingFee = Math.round((amount * offer.processingFeePercent) / 100)

            return {
                ...offer,
                rate: Math.round(rate * 100) / 100,
                tenure,
                emi,
                principal: amount,
                totalInterest,
                totalCost,
                processingFee,
                approvalOdds,
            }
        })
        .sort((a, b) => (a.rate || 0) - (b.rate || 0))
}
