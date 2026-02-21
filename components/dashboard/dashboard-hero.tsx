"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { policyData } from "@/lib/policy-data"

export function DashboardHero({ userData }: { userData: any }) {
    const score = userData.creditReadinessScore || 0
    const [index, setIndex] = useState(0)
    const [lang, setLang] = useState<"en" | "hi" | "mr">("en")

    useEffect(() => {
        const savedLang = (localStorage.getItem("language") as "en" | "hi" | "mr") || "en"
        setLang(savedLang)

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % policyData.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Calculate stroke dash for circular progress
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl mb-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-20" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20" />

            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left Content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
                        onClick={() => setIndex((prev) => (prev + 1) % policyData.length)}
                    >
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span>{policyData[index]?.text[lang] || "AI Powered Insight"}</span>
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {score > 75 ? "Excellent Profile!" : score > 50 ? "Good Progress!" : "Needs Attention"}
                    </h1>

                    <p className="text-gray-300 max-w-lg text-lg">
                        {score > 75
                            ? "You are in the top 10% of applicants. Banks are likely to offer you their best rates."
                            : "You're on the right track. Improving your document score can boost your chances by 20%."
                        }
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                        <Link href="/dashboard/loans">
                            <Button className="bg-white text-indigo-900 hover:bg-gray-100 border-0 font-semibold shadow-lg shadow-indigo-900/20">
                                Check Offers <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <Link href="/dashboard/eligibility">
                            <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-sm">
                                View Report
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Content - Circular Score */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative flex items-center justify-center w-48 h-48">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />

                        {/* SVG Circle */}
                        <svg className="transform -rotate-90 w-full h-full">
                            {/* Track */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r={radius + "%"}
                                className="stroke-white/10 fill-none"
                                strokeWidth="12"
                            />
                            {/* Progress */}
                            <motion.circle
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="50%"
                                cy="50%"
                                r={radius + "%"}
                                className="stroke-blue-400 fill-none"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                            />
                        </svg>

                        {/* Inner Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-5xl font-bold text-white">{score}</span>
                            <span className="text-xs text-uppercase tracking-wider text-blue-300 font-medium">Out of 100</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
