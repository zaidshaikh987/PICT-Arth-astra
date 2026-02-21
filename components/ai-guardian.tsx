"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Mic,
    MicOff,
    Zap,
    AlertTriangle,
    CheckCircle,
    Search,
    ArrowRight,
    Command,
    X,
    MessageSquare,
    Sparkles
} from "lucide-react"
import { useVoiceAssistant } from "@/lib/voice-assistant-context"
import { useUser } from "@/lib/user-context"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AiGuardian() {
    const {
        isListening,
        isSpeaking,
        startListening,
        stopListening,
        transcript,
        processVoiceInput
    } = useVoiceAssistant()

    const { user } = useUser()
    const router = useRouter()
    const pathname = usePathname()

    const [isOpen, setIsOpen] = useState(false)
    const [status, setStatus] = useState<"healthy" | "warning" | "critical">("healthy")
    const [message, setMessage] = useState("")
    const [command, setCommand] = useState("")
    const [isHovered, setIsHovered] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Monitor health based on user data
    useEffect(() => {
        if (!user) return

        // Simple logic for demo purposes
        const score = user.creditReadinessScore || 0
        const hasRejections = user.applicationStatus === "rejected"

        if (hasRejections) {
            setStatus("critical")
            setMessage("Application Rejected - Action Required")
        } else if (score < 60) {
            setStatus("warning")
            setMessage("Low Readiness Score - Boost it now")
        } else {
            setStatus("healthy")
            setMessage("Systems Nominal")
        }
    }, [user])

    // Auto-focus input when command center opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!command.trim()) return

        processVoiceInput(command)
        setCommand("")
        // Keep open for feedback or close? Let's keep open for a moment or show chat
    }

    // Orb Variants
    const orbVariants = {
        idle: {
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
        },
        listening: {
            scale: [1, 1.2, 1],
            boxShadow: [
                "0 0 20px 0px rgba(99, 102, 241, 0.5)",
                "0 0 50px 10px rgba(99, 102, 241, 0.8)",
                "0 0 20px 0px rgba(99, 102, 241, 0.5)"
            ],
            transition: { duration: 1.5, repeat: Infinity }
        },
        speaking: {
            scale: [1, 1.1, 0.9, 1.1, 1],
            transition: { duration: 0.5, repeat: Infinity }
        },
        critical: {
            x: [-2, 2, -2, 2, 0],
            boxShadow: "0 0 30px 5px rgba(239, 68, 68, 0.6)",
            transition: { duration: 0.2, repeat: Infinity }
        }
    }

    const orbColor =
        status === "critical" ? "bg-gradient-to-br from-red-500 to-orange-600" :
            status === "warning" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                isListening ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" :
                    "bg-gradient-to-br from-emerald-400 to-cyan-500"

    return (
        <>
            {/* 1. The Floating Orb */}
            <motion.div
                className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Keep it somewhat anchored but fun to wiggle
            >
                {/* Status Bubble */}
                <AnimatePresence>
                    {(isHovered || status !== "healthy" || isListening || isSpeaking) && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 mb-2 mr-2 text-sm font-medium text-gray-700 flex items-center gap-2 max-w-[200px]"
                        >
                            {isListening ? (
                                <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    Listening...
                                </>
                            ) : isSpeaking ? (
                                <>
                                    <MessageSquare className="w-4 h-4 text-purple-500" />
                                    Speaking...
                                </>
                            ) : (
                                <>
                                    {status === "critical" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    {status === "warning" && <Zap className="w-4 h-4 text-amber-500" />}
                                    {status === "healthy" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    <span className="truncate">{message}</span>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The Orb Itself */}
                <motion.button
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    variants={orbVariants}
                    animate={
                        status === "critical" ? "critical" :
                            isListening ? "listening" :
                                isSpeaking ? "speaking" :
                                    "idle"
                    }
                    className={`relative w-16 h-16 rounded-full shadow-2xl cursor-pointer flex items-center justify-center overflow-hidden ${orbColor}`}
                >
                    {/* Inner Texture */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>

                    {/* Icon */}
                    <motion.div
                        animate={{ rotate: isListening ? 360 : 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        {status === "critical" ? <AlertTriangle className="w-8 h-8 text-white drop-shadow-md" /> :
                            isListening ? <Mic className="w-8 h-8 text-white drop-shadow-md" /> :
                                <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                        }
                    </motion.div>

                    {/* Badge */}
                    {status === "critical" && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                    )}
                </motion.button>
            </motion.div>


            {/* 2. Command Command Center Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Main Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100/50 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${orbColor}`}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">ArthAstra Guardian</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        System Status: <span className={status === "healthy" ? "text-emerald-500" : "text-red-500"}>{status.toUpperCase()}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Chat / Input Area */}
                            <div className="p-6 space-y-6">
                                {/* Dynamic Suggestions */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 border-gray-200/50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all" onClick={() => processVoiceInput("Check eligibility")}>
                                        <Command className="w-5 h-5" />
                                        <span className="text-xs">Check Eligibility</span>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 border-gray-200/50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all" onClick={() => processVoiceInput("Compare loans")}>
                                        <Search className="w-5 h-5" />
                                        <span className="text-xs">Compare Loans</span>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 border-gray-200/50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all" onClick={() => processVoiceInput("Analyze risks")}>
                                        <AlertTriangle className="w-5 h-5" />
                                        <span className="text-xs">Risk Analysis</span>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 border-gray-200/50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all" onClick={() => processVoiceInput("Explain this page")}>
                                        <Zap className="w-5 h-5" />
                                        <span className="text-xs">Explain Page</span>
                                    </Button>
                                </div>

                                {/* Input Bar */}
                                <form onSubmit={handleCommandSubmit} className="relative flex items-center gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            {isListening ? (
                                                <div className="flex gap-1">
                                                    <span className="w-1 h-3 bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-1 h-5 bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-1 h-3 bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            ) : (
                                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            )}
                                        </div>
                                        <Input
                                            ref={inputRef}
                                            value={command || transcript}
                                            onChange={(e) => setCommand(e.target.value)}
                                            placeholder={isListening ? "Listening..." : "Ask me anything or type a command..."}
                                            className="pl-12 py-6 text-lg rounded-2xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className={`rounded-xl transition-all ${isListening ? "bg-red-50 text-red-500 hover:bg-red-100" : "hover:bg-gray-100 text-gray-400"}`}
                                                onClick={isListening ? stopListening : startListening}
                                            >
                                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all shrink-0"
                                        disabled={!command && !transcript}
                                    >
                                        <ArrowRight className="w-6 h-6 text-white" />
                                    </Button>
                                </form>
                            </div>

                            {/* Footer / Context */}
                            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
                                Protected by ArthAstra Neural Shield • v2.5.0
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
