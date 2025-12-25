"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gavel, Heart, ShieldAlert, Sparkles, Loader2, User } from "lucide-react"

interface CouncilVisualizerProps {
    userData: any
}

export default function CouncilVisualizer({ userData }: CouncilVisualizerProps) {
    const [status, setStatus] = useState<"idle" | "meeting" | "decided">("idle")
    const [result, setResult] = useState<any>(null)

    const startCouncil = async () => {
        setStatus("meeting")
        try {
            const res = await fetch("/api/council-meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })
            const data = await res.json()
            // Simulate reading time for effect
            setTimeout(() => {
                setResult(data)
                setStatus("decided")
            }, 2000)
        } catch (e) {
            console.error(e)
            setStatus("idle")
        }
    }

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Gavel className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                            The Financial Council
                        </h2>
                        <p className="text-slate-400 text-sm">3 AI Specialist Agents are reviewing your case.</p>
                    </div>
                    {status === "idle" && (
                        <Button
                            onClick={startCouncil}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                        >
                            Convene The Council <Gavel className="ml-2 w-4 h-4" />
                        </Button>
                    )}
                </div>

                {status === "meeting" && !result && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                        <p className="text-amber-200 animate-pulse">The Council is deliberating...</p>
                        <div className="flex gap-4 opacity-50">
                            <User className="w-8 h-8 text-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <User className="w-8 h-8 text-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <User className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {result && (
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Optimist */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 p-4 rounded-xl border border-green-500/30"
                            >
                                <div className="flex items-center gap-2 mb-3 text-green-400">
                                    <Heart className="w-5 h-5" />
                                    <span className="font-bold">The Optimist</span>
                                </div>
                                <p className="text-sm text-slate-300 italic">"{result.optimistArgument}"</p>
                            </motion.div>

                            {/* Pessimist */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-slate-800/50 p-4 rounded-xl border border-red-500/30"
                            >
                                <div className="flex items-center gap-2 mb-3 text-red-400">
                                    <ShieldAlert className="w-5 h-5" />
                                    <span className="font-bold">The Pessimist</span>
                                </div>
                                <p className="text-sm text-slate-300 italic">"{result.pessimistArgument}"</p>
                            </motion.div>

                            {/* Judge */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="md:col-span-3 mt-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6 rounded-xl border border-amber-500/50 text-center"
                            >
                                <div className="flex items-center justify-center gap-2 mb-4 text-amber-400">
                                    <Gavel className="w-8 h-8" />
                                    <span className="font-bold text-xl">The Final Verdict</span>
                                </div>
                                <p className="text-lg text-white font-medium mb-4">"{result.judgeVerdict}"</p>

                                <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-lg ${result.approved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {result.approved ? "APPROVED ✅" : "REJECTED ❌"}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
