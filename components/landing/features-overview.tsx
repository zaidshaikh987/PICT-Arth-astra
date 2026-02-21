"use client"

import { motion } from "framer-motion"
import { Brain, Target, TrendingUp, Shield, Users, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Eligibility",
    description: "Instant loan eligibility check with transparent scoring system",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Target,
    title: "Credit Path Optimizer",
    description: "Get personalized roadmap to improve your loan approval chances",
    gradient: "from-indigo-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Smart Recommendations",
    description: "AI matches you with the best loans for your unique profile",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "No Credit Impact",
    description: "Check eligibility without affecting your credit score",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Joint Application Support",
    description: "See how adding a co-borrower increases your eligibility",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Sparkles,
    title: "Rejection Recovery",
    description: "Turn rejection into a guided improvement journey",
    gradient: "from-purple-500 to-pink-500",
  },
]

export default function FeaturesOverview() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Why Choose ArthAstra?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intelligent loan guidance powered by AI, designed for every Indian borrower
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 group border-2 hover:border-blue-200">
                <div
                  className={`bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
