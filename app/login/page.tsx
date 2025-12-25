"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, ArrowRight, Loader2, Phone } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const [phone, setPhone] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Simulate network delay
        setTimeout(() => {
            try {
                const storedData = localStorage.getItem("onboardingData")
                if (!storedData) {
                    setError("No account found. Please Sign Up first.")
                    setIsLoading(false)
                    return
                }

                const profile = JSON.parse(storedData)
                // Simple check: user must enter the same phone number
                // Remove spaces/dashes for comparison
                const storedPhone = (profile.phone || "").replace(/\D/g, "")
                const inputPhone = phone.replace(/\D/g, "")

                if (storedPhone && inputPhone === storedPhone) {
                    localStorage.setItem("arthAstraSession", "true")
                    window.location.href = "/dashboard"
                } else {
                    setError("Invalid phone number. Account not found.")
                    setIsLoading(false)
                }
            } catch (err) {
                setError("Error accessing account data.")
                setIsLoading(false)
            }
        }, 1000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
            <Card className="w-full max-w-md p-8 shadow-2xl border-2 border-emerald-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Enter your phone number to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                            Phone Number
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Example: 9876543210"
                                className="pl-10 h-11"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-base font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Login to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/" className="text-emerald-600 font-semibold hover:underline">
                            Sign Up via Onboarding
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    )
}
