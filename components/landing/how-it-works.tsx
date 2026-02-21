"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Share Basic Details",
    description: "Tell us about your income, employment, and loan needs. Takes just 2 minutes.",
    color: "bg-blue-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Get Instant Eligibility",
    description:
      "Our system analyzes your profile and shows your eligibility, credit readiness score, and personalized roadmap.",
    color: "bg-indigo-500",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Apply with Confidence",
    description: "Review matched loans, simulate scenarios, and apply when you're ready with 90%+ approval confidence.",
    color: "bg-cyan-500",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">From confused to confident in just 3 simple steps</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="mb-12 last:mb-0"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Icon Circle */}
                <div className="flex-shrink-0">
                  <div className={`${step.color} w-24 h-24 rounded-full flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-md border-2 border-gray-100">
                  <div className="text-5xl font-bold text-gray-200 mb-2">{step.number}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-6">
                  <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-gray-100 rounded-full" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/onboarding">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
