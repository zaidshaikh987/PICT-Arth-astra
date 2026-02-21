"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BookOpen,
    Play,
    CheckCircle,
    Clock,
    ChevronRight,
    ChevronDown,
    Trophy,
    RotateCcw,
    TrendingUp,
    CreditCard,
    PiggyBank,
    Target,
    Lightbulb,
    ArrowRight,
    Video,
    FileText,
    Award,
    Youtube,
    ExternalLink,
} from "lucide-react"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Learning Modules Data with Real YouTube Videos
const learningModules = [
    {
        id: "credit-basics",
        title: "Credit Score Mastery",
        description: "Understand how CIBIL scores work and how to improve yours",
        icon: CreditCard,
        color: "from-blue-500 to-indigo-600",
        duration: "25 min",
        lessons: [
            {
                id: "what-is-credit",
                title: "What is a Credit Score?",
                type: "reading",
                duration: "4 min",
                content: {
                    sections: [
                        {
                            title: "Understanding Credit Scores",
                            content: "A credit score is a 3-digit number (300-900) that represents your creditworthiness. It tells lenders how likely you are to repay borrowed money. In India, CIBIL (Credit Information Bureau India Limited) is the primary credit bureau."
                        },
                        {
                            title: "Credit Score Ranges",
                            type: "table",
                            data: [
                                { range: "300-549", rating: "Poor", approval: "Very difficult to get loans" },
                                { range: "550-649", rating: "Fair", approval: "Limited options, high interest" },
                                { range: "650-749", rating: "Good", approval: "Most lenders approve" },
                                { range: "750-900", rating: "Excellent", approval: "Best rates & terms" },
                            ]
                        },
                        {
                            title: "Why It Matters",
                            type: "list",
                            items: [
                                "Determines if you get approved for loans and credit cards",
                                "Affects the interest rate you pay (higher score = lower rate)",
                                "Landlords may check it before renting to you",
                                "Some employers check credit for financial roles"
                            ]
                        },
                        {
                            title: "Key Takeaway",
                            type: "highlight",
                            content: "Aim for 750+ to get the best interest rates. Every 50-point increase can save you lakhs in interest over the life of a loan!"
                        }
                    ]
                }
            },
            {
                id: "credit-factors-video",
                title: "5 Factors That Affect Your Score",
                type: "video",
                duration: "10 min",
                youtubeId: "r5aGx3VHwGM", // Ankur Warikoo CIBIL video
                youtubeTitle: "Credit/CIBIL Score explained | Ankur Warikoo",
                channel: "Ankur Warikoo",
                content: {
                    sections: [
                        {
                            title: "The 5 Pillars of Credit Score",
                            type: "numbered",
                            items: [
                                { title: "Payment History (35%)", desc: "Most important! Always pay bills on time." },
                                { title: "Credit Utilization (30%)", desc: "Keep usage below 30% of your credit limit." },
                                { title: "Credit History Length (15%)", desc: "Older accounts help your score." },
                                { title: "Credit Mix (10%)", desc: "Have both secured and unsecured credit." },
                                { title: "New Credit Inquiries (10%)", desc: "Too many applications = red flag." }
                            ]
                        }
                    ]
                }
            },
            {
                id: "improve-score",
                title: "7 Ways to Boost Your Score",
                type: "reading",
                duration: "5 min",
                content: {
                    sections: [
                        {
                            title: "Immediate Actions (0-30 days)",
                            type: "checklist",
                            items: [
                                "Pay all pending dues immediately",
                                "Check CIBIL report for errors and dispute them",
                                "Reduce credit card balance to below 30%"
                            ]
                        },
                        {
                            title: "Medium-term (1-6 months)",
                            type: "checklist",
                            items: [
                                "Set up auto-pay for all bills",
                                "Become authorized user on family member's good credit card",
                                "Keep old cards active with small purchases"
                            ]
                        },
                        {
                            title: "Long-term (6-12 months)",
                            type: "checklist",
                            items: [
                                "Build credit mix with secured loan",
                                "Avoid multiple loan applications",
                                "Maintain consistent payment history"
                            ]
                        },
                        {
                            title: "Pro Tip",
                            type: "highlight",
                            content: "Your credit score can increase by 50-100 points in 6 months with consistent good behavior!"
                        }
                    ]
                }
            },
            {
                id: "credit-myths-video",
                title: "Credit Score Myths Busted",
                type: "video",
                duration: "6 min",
                youtubeId: "1fD5QoG7zrM", // AssetYogi credit score video
                youtubeTitle: "CIBIL Score Explained in Hindi",
                channel: "Asset Yogi",
                content: {
                    sections: [
                        {
                            title: "Common Myths vs Reality",
                            type: "myths",
                            items: [
                                { myth: "Checking your own score hurts it", reality: "Soft inquiries don't affect your score" },
                                { myth: "Closing old cards improves score", reality: "It can HURT by reducing credit history" },
                                { myth: "Income affects credit score", reality: "Income is NOT part of credit calculation" },
                                { myth: "Paying minimum is enough", reality: "High balances hurt utilization ratio" },
                                { myth: "All debt is bad", reality: "Managed debt with timely payments builds credit" }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "budgeting",
        title: "Smart Budgeting",
        description: "Master your money with proven budgeting techniques",
        icon: PiggyBank,
        color: "from-emerald-500 to-teal-600",
        duration: "20 min",
        lessons: [
            {
                id: "why-budget",
                title: "Why Budgeting Changes Everything",
                type: "reading",
                duration: "3 min",
                content: {
                    sections: [
                        {
                            title: "The Power of Budgeting",
                            content: "Without a budget, you're driving blind. A budget isn't about restricting yourself—it's about understanding and controlling where your money goes."
                        },
                        {
                            title: "Benefits of Budgeting",
                            type: "cards",
                            items: [
                                { icon: "🎯", title: "Control", desc: "Know exactly where every rupee goes" },
                                { icon: "📈", title: "Growth", desc: "Identify savings opportunities" },
                                { icon: "🛡️", title: "Protection", desc: "Build emergency fund for unexpected events" },
                                { icon: "🏆", title: "Goals", desc: "Achieve dreams systematically" }
                            ]
                        },
                        {
                            title: "The Statistics",
                            type: "highlight",
                            content: "People with budgets are 3x more likely to be debt-free and 2x more likely to save for retirement."
                        }
                    ]
                }
            },
            {
                id: "50-30-20-video",
                title: "The 50-30-20 Rule Explained",
                type: "video",
                duration: "8 min",
                youtubeId: "HQzoZfc3GwQ", // Ankur Warikoo money management video
                youtubeTitle: "50-30-20 Rule | Money Management Tips",
                channel: "Ankur Warikoo",
                content: {
                    sections: [
                        {
                            title: "The Simple Formula",
                            type: "budget",
                            items: [
                                { percent: "50%", category: "NEEDS", examples: "Rent, Groceries, Utilities, Insurance, Minimum debt payments", color: "bg-blue-500" },
                                { percent: "30%", category: "WANTS", examples: "Dining out, Entertainment, Shopping, Vacations, Subscriptions", color: "bg-purple-500" },
                                { percent: "20%", category: "SAVINGS", examples: "Emergency fund, Investments, Extra debt payments, Retirement", color: "bg-emerald-500" }
                            ]
                        },
                        {
                            title: "Example: ₹50,000 Salary",
                            type: "table",
                            data: [
                                { category: "Needs (50%)", amount: "₹25,000" },
                                { category: "Wants (30%)", amount: "₹15,000" },
                                { category: "Savings (20%)", amount: "₹10,000" }
                            ]
                        }
                    ]
                }
            },
            {
                id: "emergency-fund",
                title: "Building Your Emergency Fund",
                type: "reading",
                duration: "4 min",
                content: {
                    sections: [
                        {
                            title: "What is an Emergency Fund?",
                            content: "An emergency fund is 3-6 months of living expenses saved in a liquid, easily accessible account. It's your financial safety net for unexpected situations."
                        },
                        {
                            title: "When You'll Need It",
                            type: "list",
                            items: [
                                "Job loss or income reduction",
                                "Medical emergencies",
                                "Car or home repairs",
                                "Family emergencies"
                            ]
                        },
                        {
                            title: "How to Build It",
                            type: "steps",
                            items: [
                                { step: 1, title: "Calculate Target", desc: "Monthly expenses × 6 = Your goal" },
                                { step: 2, title: "Start Small", desc: "Even ₹500/week adds up to ₹26,000/year" },
                                { step: 3, title: "Automate", desc: "Set up auto-transfer on salary day" },
                                { step: 4, title: "Keep It Separate", desc: "Use a different savings account" }
                            ]
                        },
                        {
                            title: "Challenge",
                            type: "highlight",
                            content: "Start your emergency fund TODAY with just ₹1,000!"
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "loans",
        title: "Loan Intelligence",
        description: "Navigate loans like a pro - from application to repayment",
        icon: TrendingUp,
        color: "from-purple-500 to-pink-600",
        duration: "30 min",
        lessons: [
            {
                id: "loan-types",
                title: "Types of Loans in India",
                type: "reading",
                duration: "6 min",
                content: {
                    sections: [
                        {
                            title: "Secured Loans",
                            content: "Backed by collateral (asset). Lower interest rates because lender has security."
                        },
                        {
                            title: "Secured Loan Types",
                            type: "loanCards",
                            items: [
                                { icon: "🏠", name: "Home Loan", rate: "8-10%", tenure: "Up to 30 years", note: "Tax benefits under Section 80C & 24" },
                                { icon: "🚗", name: "Car Loan", rate: "7-12%", tenure: "1-7 years", note: "Vehicle serves as collateral" },
                                { icon: "🏢", name: "Loan Against Property", rate: "8-12%", tenure: "Up to 20 years", note: "Lower rate than personal loan" }
                            ]
                        },
                        {
                            title: "Unsecured Loans",
                            content: "No collateral required. Higher interest rates due to increased risk for lender."
                        },
                        {
                            title: "Unsecured Loan Types",
                            type: "loanCards",
                            items: [
                                { icon: "💳", name: "Personal Loan", rate: "10-24%", tenure: "1-5 years", note: "Quick approval, no security" },
                                { icon: "🎓", name: "Education Loan", rate: "8-15%", tenure: "5-15 years", note: "Moratorium period available" },
                                { icon: "💼", name: "Business Loan", rate: "12-24%", tenure: "1-5 years", note: "For working capital needs" }
                            ]
                        }
                    ]
                }
            },
            {
                id: "emi-video",
                title: "How EMI is Calculated",
                type: "video",
                duration: "10 min",
                youtubeId: "8sn1l5U16hM", // FinCalC EMI calculation video
                youtubeTitle: "Loan EMI & Interest Calculation",
                channel: "FinCalC TV",
                content: {
                    sections: [
                        {
                            title: "The EMI Formula",
                            type: "formula",
                            content: "EMI = P × r × (1+r)^n / [(1+r)^n - 1]",
                            explanation: [
                                { term: "P", meaning: "Principal (loan amount)" },
                                { term: "r", meaning: "Monthly interest rate (annual rate ÷ 12 ÷ 100)" },
                                { term: "n", meaning: "Tenure in months" }
                            ]
                        },
                        {
                            title: "Example Calculation",
                            type: "example",
                            loan: "₹10,00,000",
                            rate: "10% per annum",
                            tenure: "5 years (60 months)",
                            emi: "₹21,247/month",
                            breakdown: [
                                { label: "Principal Repaid", value: "₹10,00,000" },
                                { label: "Total Interest", value: "₹2,74,820" },
                                { label: "Total Amount Paid", value: "₹12,74,820" }
                            ]
                        },
                        {
                            title: "Pro Tip",
                            type: "highlight",
                            content: "Increase EMI by 10% each year to close loan faster and save lakhs in interest!"
                        }
                    ]
                }
            },
            {
                id: "loan-mistakes",
                title: "5 Costly Loan Mistakes to Avoid",
                type: "reading",
                duration: "5 min",
                content: {
                    sections: [
                        {
                            title: "Common Mistakes",
                            type: "mistakes",
                            items: [
                                {
                                    number: 1,
                                    mistake: "Not Comparing Lenders",
                                    impact: "A 1% difference on ₹50L home loan = ₹6L more in interest!",
                                    solution: "Get quotes from at least 3-4 banks"
                                },
                                {
                                    number: 2,
                                    mistake: "Ignoring Processing Fees",
                                    impact: "That 'low rate' might have 2-3% hidden fees",
                                    solution: "Calculate total cost including all fees"
                                },
                                {
                                    number: 3,
                                    mistake: "Choosing Maximum Tenure",
                                    impact: "Longer tenure = MUCH more interest paid",
                                    solution: "Choose shortest tenure you can afford"
                                },
                                {
                                    number: 4,
                                    mistake: "Skipping Loan Insurance",
                                    impact: "Family burden if something happens to you",
                                    solution: "Get term insurance covering loan amount"
                                },
                                {
                                    number: 5,
                                    mistake: "Not Reading Fine Print",
                                    impact: "Prepayment penalties, rate revision clauses",
                                    solution: "Read ALL terms before signing"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "investing",
        title: "Investment Basics",
        description: "Start your wealth-building journey with confidence",
        icon: Target,
        color: "from-orange-500 to-red-600",
        duration: "25 min",
        lessons: [
            {
                id: "why-invest-video",
                title: "Why Investing Beats Saving",
                type: "video",
                duration: "12 min",
                youtubeId: "hV9eJGLO4gg", // CA Rachana Ranade mutual funds video
                youtubeTitle: "Mutual Funds for Beginners",
                channel: "CA Rachana Phadke Ranade",
                content: {
                    sections: [
                        {
                            title: "Saving vs Investing (20 years)",
                            type: "comparison",
                            scenario: "₹10,000/month for 20 years",
                            options: [
                                { method: "Savings Account", rate: "4%", result: "₹36.8 Lakhs", color: "bg-gray-400" },
                                { method: "Fixed Deposit", rate: "7%", result: "₹52.4 Lakhs", color: "bg-blue-400" },
                                { method: "Mutual Funds", rate: "12%", result: "₹1.0 Crore!", color: "bg-emerald-500" }
                            ]
                        },
                        {
                            title: "The Power of Starting Early",
                            type: "timeline",
                            items: [
                                { age: "25", investment: "₹5,000/month", result: "₹3.2 Cr by age 55" },
                                { age: "35", investment: "₹5,000/month", result: "₹1.0 Cr by age 55" },
                                { age: "45", investment: "₹5,000/month", result: "₹30 L by age 55" }
                            ]
                        },
                        {
                            title: "Key Insight",
                            type: "highlight",
                            content: "10 years delay = 70% less wealth! Start early, even with small amounts."
                        }
                    ]
                }
            },
            {
                id: "sip-basics",
                title: "SIP - Your Wealth Building Tool",
                type: "reading",
                duration: "6 min",
                content: {
                    sections: [
                        {
                            title: "What is SIP?",
                            content: "Systematic Investment Plan (SIP) is like an EMI, but for building wealth! You invest a fixed amount regularly in mutual funds."
                        },
                        {
                            title: "How SIP Works",
                            type: "steps",
                            items: [
                                { step: 1, title: "Fixed Amount", desc: "Choose amount (min ₹500/month)" },
                                { step: 2, title: "Auto Debit", desc: "Money debited on fixed date" },
                                { step: 3, title: "Buy Units", desc: "Mutual fund units purchased" },
                                { step: 4, title: "Compounding", desc: "Returns generate more returns" }
                            ]
                        },
                        {
                            title: "SIP Benefits",
                            type: "cards",
                            items: [
                                { icon: "📅", title: "Discipline", desc: "Forced regular savings" },
                                { icon: "💰", title: "Flexibility", desc: "Start with just ₹500" },
                                { icon: "📊", title: "Averaging", desc: "Buy more units when market is low" },
                                { icon: "📈", title: "Compounding", desc: "Wealth multiplies over time" }
                            ]
                        },
                        {
                            title: "Fund Types by Risk",
                            type: "riskLevels",
                            items: [
                                { level: "Low Risk", funds: ["Debt Funds", "Liquid Funds"], color: "bg-green-100 text-green-700" },
                                { level: "Medium Risk", funds: ["Balanced/Hybrid Funds", "Large-cap Funds"], color: "bg-yellow-100 text-yellow-700" },
                                { level: "Higher Risk", funds: ["Mid-cap Funds", "Small-cap Funds"], color: "bg-red-100 text-red-700" }
                            ]
                        },
                        {
                            title: "Start Today",
                            type: "highlight",
                            content: "Even ₹500/month grows to ₹5+ Lakhs in 15 years at 12% returns!"
                        }
                    ]
                }
            },
            {
                id: "mf-video",
                title: "Choosing Your First Mutual Fund",
                type: "video",
                duration: "8 min",
                youtubeId: "potB0wSI1MM", // Yadnya Investment Academy
                youtubeTitle: "How To Start SIP | SIP Investment for Beginners",
                channel: "Yadnya Investment Academy",
                content: {
                    sections: [
                        {
                            title: "For Beginners: Start Here",
                            type: "recommendations",
                            items: [
                                { type: "Index Funds", why: "Low cost, tracks Nifty/Sensex, good for beginners" },
                                { type: "Large Cap Funds", why: "Invest in top 100 companies, relatively stable" },
                                { type: "Flexi Cap Funds", why: "Fund manager picks best opportunities" }
                            ]
                        },
                        {
                            title: "Quick Start Guide",
                            type: "checklist",
                            items: [
                                "Choose a platform (Groww, Zerodha, Paytm Money)",
                                "Complete KYC (takes 5 mins with Aadhaar)",
                                "Select a fund (start with Nifty 50 Index Fund)",
                                "Set up monthly SIP of ₹500-5000",
                                "Stay invested for 5+ years minimum"
                            ]
                        }
                    ]
                }
            }
        ]
    }
]

// Render different section types
const renderSection = (section: any, index: number) => {
    switch (section.type) {
        case "table":
            return (
                <div key={index} className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                {Object.keys(section.data[0]).map((key) => (
                                    <th key={key} className="p-3 text-left font-semibold capitalize border">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {section.data.map((row: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    {Object.values(row).map((val: any, j: number) => (
                                        <td key={j} className="p-3 border">{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )

        case "list":
            return (
                <ul key={index} className="space-y-2">
                    {section.items.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )

        case "numbered":
            return (
                <div key={index} className="space-y-4">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "checklist":
            return (
                <div key={index} className="space-y-2">
                    {section.items.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <div className="w-5 h-5 border-2 border-emerald-500 rounded flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-gray-700">{item}</span>
                        </div>
                    ))}
                </div>
            )

        case "cards":
            return (
                <div key={index} className="grid grid-cols-2 gap-4">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border">
                            <span className="text-2xl">{item.icon}</span>
                            <h4 className="font-semibold mt-2">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            )

        case "steps":
            return (
                <div key={index} className="space-y-4">
                    {section.items.map((item: any) => (
                        <div key={item.step} className="flex gap-4">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "budget":
            return (
                <div key={index} className="space-y-3">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                            <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                                {item.percent}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{item.category}</h4>
                                <p className="text-sm text-gray-600">{item.examples}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "loanCards":
            return (
                <div key={index} className="grid gap-3">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
                            <span className="text-3xl">{item.icon}</span>
                            <div className="flex-1">
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.note}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-emerald-600">{item.rate}</div>
                                <div className="text-xs text-gray-500">{item.tenure}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "mistakes":
            return (
                <div key={index} className="space-y-4">
                    {section.items.map((item: any) => (
                        <div key={item.number} className="border border-red-100 rounded-xl overflow-hidden">
                            <div className="bg-red-50 p-3 flex items-center gap-3">
                                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {item.number}
                                </span>
                                <span className="font-semibold text-red-700">❌ {item.mistake}</span>
                            </div>
                            <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-600"><strong>Impact:</strong> {item.impact}</p>
                                <p className="text-sm text-emerald-600"><strong>✅ Solution:</strong> {item.solution}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "myths":
            return (
                <div key={index} className="space-y-3">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <span className="text-red-500 font-bold">❌</span>
                                <div>
                                    <p className="font-medium text-gray-700">Myth: {item.myth}</p>
                                    <p className="text-emerald-600 mt-1">✅ Reality: {item.reality}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "comparison":
            return (
                <div key={index} className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">{section.scenario}</p>
                    {section.options.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                            <div className={`w-3 h-12 ${opt.color} rounded-full`} />
                            <div className="flex-1">
                                <div className="font-medium">{opt.method}</div>
                                <div className="text-sm text-gray-500">{opt.rate} returns</div>
                            </div>
                            <div className="text-right font-bold text-lg">{opt.result}</div>
                        </div>
                    ))}
                </div>
            )

        case "riskLevels":
            return (
                <div key={index} className="space-y-3">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className={`p-4 rounded-xl ${item.color}`}>
                            <h4 className="font-semibold mb-2">{item.level}</h4>
                            <div className="flex flex-wrap gap-2">
                                {item.funds.map((fund: string, j: number) => (
                                    <Badge key={j} variant="secondary">{fund}</Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )

        case "highlight":
            return (
                <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">{section.title || "Key Insight"}</span>
                    </div>
                    <p className="text-gray-700">{section.content}</p>
                </div>
            )

        default:
            return (
                <p key={index} className="text-gray-700 leading-relaxed">{section.content}</p>
            )
    }
}

export default function LearningModules() {
    const { user, updateUser } = useUser()
    const { toast } = useToast()
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
    const [expandedModule, setExpandedModule] = useState<string | null>(null)

    // Load completed lessons from localStorage (or sync with user profile if we had a field for it)
    useEffect(() => {
        const saved = localStorage.getItem("completedLessons")
        if (saved) setCompletedLessons(new Set(JSON.parse(saved)))
    }, [])

    const markComplete = async (lessonId: string) => {
        if (completedLessons.has(lessonId)) return

        const newCompleted = new Set([...completedLessons, lessonId])
        setCompletedLessons(newCompleted)
        localStorage.setItem("completedLessons", JSON.stringify([...newCompleted]))

        // Award XP
        if (user) {
            const currentXP = user.xp || 0
            const newXP = currentXP + 50 // 50 XP per lesson
            const currentBadges = user.badges || []
            let newBadges = [...currentBadges]
            let badgeEarned = null

            // Check for badges
            if (newCompleted.size === 1 && !currentBadges.includes("First Step")) {
                newBadges.push("First Step")
                badgeEarned = "First Step"
            }
            if (newCompleted.size === 5 && !currentBadges.includes("Fast Learner")) {
                newBadges.push("Fast Learner")
                badgeEarned = "Fast Learner"
            }

            await updateUser({ xp: newXP, badges: newBadges })

            toast({
                title: badgeEarned ? `Badge Unlocked: ${badgeEarned}!` : "+50 XP Earned!",
                description: badgeEarned ? "You are making great progress." : "Lesson completed successfully.",
                variant: "default",
                className: "bg-green-50 border-green-200"
            })
        }
    }

    const getModuleProgress = (moduleId: string) => {
        const module = learningModules.find(m => m.id === moduleId)
        if (!module) return 0
        const completed = module.lessons.filter(l => completedLessons.has(l.id)).length
        return (completed / module.lessons.length) * 100
    }

    const isRecommended = (moduleId: string) => {
        if (!user) return false
        if (moduleId === "credit-basics" && (user.creditScore || 0) < 750) return true
        if (moduleId === "budgeting" && (user.monthlyExpenses || 0) > (user.monthlyIncome || 1) * 0.5) return true
        if (moduleId === "loans" && !user.hasCreditHistory) return true
        if (moduleId === "investing" && (user.savingsRange === "0-50k")) return true
        return false
    }

    const totalLessons = learningModules.reduce((acc, m) => acc + m.lessons.length, 0)
    const totalCompleted = completedLessons.size
    const overallProgress = (totalCompleted / totalLessons) * 100

    // YouTube Player Component
    const YouTubePlayer = ({ videoId, title, channel }: { videoId: string; title: string; channel: string }) => (
        <div className="space-y-3">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg group">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-700">{channel}</span>
                </div>
                <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    Watch on YouTube <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    )

    // Lesson Detail View
    if (selectedLesson) {
        const module = learningModules.find(m => m.lessons.some(l => l.id === selectedLesson))
        const lesson = module?.lessons.find(l => l.id === selectedLesson)
        if (!lesson || !module) return null

        const lessonIndex = module.lessons.findIndex(l => l.id === selectedLesson)
        const nextLesson = module.lessons[lessonIndex + 1]
        const isCompleted = completedLessons.has(lesson.id)

        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => setSelectedLesson(null)} className="mb-4">
                    ← Back to {module.title}
                </Button>

                {/* Lesson Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                            {lesson.type === "video" ? <Video className="w-7 h-7 text-white" /> : <FileText className="w-7 h-7 text-white" />}
                        </div>
                        <div>
                            <Badge variant="outline" className="mb-1">
                                {lesson.type === "video" ? "📹 Video Lesson" : "📖 Reading"}
                            </Badge>
                            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4" /> {lesson.duration}
                            </p>
                        </div>
                    </div>
                    {isCompleted && (
                        <Badge className="bg-emerald-500">
                            <CheckCircle className="w-4 h-4 mr-1" /> Completed
                        </Badge>
                    )}
                </div>

                {/* YouTube Video */}
                {lesson.type === "video" && lesson.youtubeId && (
                    <YouTubePlayer
                        videoId={lesson.youtubeId}
                        title={lesson.youtubeTitle || lesson.title}
                        channel={lesson.channel || "YouTube"}
                    />
                )}

                {/* Content Sections */}
                <Card>
                    <CardContent className="p-6 space-y-8">
                        {lesson.content.sections.map((section: any, index: number) => (
                            <div key={index} className="space-y-3">
                                {section.title && (
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        {section.title}
                                    </h3>
                                )}
                                {renderSection(section, index)}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    {!isCompleted && (
                        <Button
                            onClick={() => markComplete(lesson.id)}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Mark as Complete
                        </Button>
                    )}
                    {nextLesson && (
                        <Button
                            onClick={() => setSelectedLesson(nextLesson.id)}
                            variant={isCompleted ? "default" : "outline"}
                            className={isCompleted ? "flex-1 bg-gradient-to-r from-purple-500 to-pink-600" : "flex-1"}
                        >
                            Next: {nextLesson.title}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    )}
                    {!nextLesson && isCompleted && (
                        <Button
                            onClick={() => setSelectedLesson(null)}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600"
                        >
                            <Trophy className="w-5 h-5 mr-2" />
                            Module Complete!
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Learning Center</h1>
                        <p className="text-gray-500">Master your finances with interactive video lessons</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{totalCompleted}/{totalLessons}</div>
                    <div className="text-sm text-gray-500">Lessons Completed</div>
                </div>
            </div>

            {/* Overall Progress */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Your Learning Journey</h3>
                            <p className="text-white/80">Keep learning! You're making great progress.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
                            <div className="text-sm text-white/80">Complete</div>
                        </div>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-3">
                        <motion.div
                            className="bg-white h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    {totalCompleted >= 5 && (
                        <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 w-fit">
                            <Award className="w-5 h-5 text-yellow-300" />
                            <span className="font-medium">Fast Learner Badge Earned!</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Module Cards */}
            <div className="grid gap-4">
                {learningModules.map((module) => {
                    const progress = getModuleProgress(module.id)
                    const Icon = module.icon
                    const isExpanded = expandedModule === module.id
                    const videoCount = module.lessons.filter(l => l.type === "video").length

                    return (
                        <motion.div key={module.id} layout>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                                    {progress === 100 && (
                                                        <Badge className="bg-emerald-500">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Done
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-sm">{module.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4" /> {module.lessons.length} lessons
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Youtube className="w-4 h-4 text-red-500" /> {videoCount} videos
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" /> {module.duration}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-16 h-16 relative">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                                                        <circle
                                                            cx="32" cy="32" r="28"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="4"
                                                            fill="none"
                                                            strokeDasharray={`${progress * 1.76} 176`}
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                                <stop offset="100%" stopColor="#ec4899" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                                                        {Math.round(progress)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </CardContent>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                                <div className="space-y-2">
                                                    {module.lessons.map((lesson, idx) => {
                                                        const isComplete = completedLessons.has(lesson.id)
                                                        return (
                                                            <motion.button
                                                                key={lesson.id}
                                                                whileHover={{ x: 4 }}
                                                                onClick={() => setSelectedLesson(lesson.id)}
                                                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left shadow-sm"
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete
                                                                    ? 'bg-emerald-100 text-emerald-600'
                                                                    : 'bg-gray-100 text-gray-400'
                                                                    }`}>
                                                                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold">{idx + 1}</span>}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-gray-900">{lesson.title}</span>
                                                                        {lesson.type === "video" && (
                                                                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                                                                <Youtube className="w-3 h-3 mr-1" /> Video
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm text-gray-500">{lesson.duration}</span>
                                                                </div>
                                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                                            </motion.button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
