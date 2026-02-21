"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

export default function CallToAction() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Start Your Loan Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of Indians making smarter borrowing decisions with AI-powered guidance
          </p>

          {/* Email Capture Form */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 px-6 text-lg bg-white/95 backdrop-blur border-0 focus-visible:ring-2 focus-visible:ring-yellow-300"
            />
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 h-14 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all group w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <p className="text-white/80 text-sm">✓ No credit card required • ✓ 100% free forever • ✓ No hidden charges</p>
        </motion.div>
      </div>
    </section>
  )
}
