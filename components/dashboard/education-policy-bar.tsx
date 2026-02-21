"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { Lightbulb, Info, FileText, X, ChevronUp, ChevronDown } from "lucide-react"
import { policyData, PolicyFact } from "@/lib/policy-data"

export default function EducationPolicyBar() {
    const [isVisible, setIsVisible] = useState(true)
    const [isExpanded, setIsExpanded] = useState(false)
    const [currentFact, setCurrentFact] = useState<PolicyFact | null>(null)
    const [lang, setLang] = useState<"en" | "hi" | "mr">("en")
    const pathname = usePathname()

    // Need to strip the locale prefix if using next-intl, but here we just use pathname
    // Simple context matching
    const getContext = () => {
        if (pathname?.includes("loans")) return "loans"
        if (pathname?.includes("eligibility")) return "eligibility"
        if (pathname?.includes("optimizer")) return "optimizer"
        if (pathname?.includes("documents")) return "documents"
        return "dashboard"
    }

    useEffect(() => {
        const savedLang = (localStorage.getItem("language") as "en" | "hi" | "mr") || "en"
        setLang(savedLang)

        const context = getContext()
        const relevantFacts = policyData.filter(f => !f.context || f.context.includes(context))

        // Pick random if multiple, or cycle? Random for now.
        const randomFact = relevantFacts[Math.floor(Math.random() * relevantFacts.length)] || policyData[0]
        setCurrentFact(randomFact)

        // Interval to rotate facts every 30s
        const interval = setInterval(() => {
            const nextFact = relevantFacts[Math.floor(Math.random() * relevantFacts.length)]
            setCurrentFact(nextFact)
        }, 30000)

        return () => clearInterval(interval)
    }, [pathname])

    if (!isVisible || !currentFact) return null

    // Icon mapping
    const Icon = currentFact.category === "fact" ? Lightbulb : currentFact.category === "update" ? FileText : Info
    const colorClass = currentFact.category === "fact" ? "text-yellow-400" : currentFact.category === "update" ? "text-blue-400" : "text-emerald-400"
    const bgClass = currentFact.category === "fact" ? "bg-yellow-400/10" : currentFact.category === "update" ? "bg-blue-400/10" : "bg-emerald-400/10"

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 right-24 z-40 max-w-sm w-full"
                >
                    {/* Main Card */}
                    <div className="glass-card overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 shadow-2xl rounded-2xl">

                        {/* Header / Collapsed View */}
                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${bgClass}`}>
                                    <Icon className={`w-5 h-5 ${colorClass}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {currentFact.category === "fact" ? "Did You Know?" : currentFact.category === "update" ? "Policy Update" : "Smart Tip"}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                        {currentFact.text[lang]}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsVisible(false) }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-4"
                                >
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {currentFact.text[lang]}
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                            Learn More →
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Bar (Timer) */}
                        <motion.div
                            key={currentFact.id}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 30, ease: "linear" }}
                            className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
