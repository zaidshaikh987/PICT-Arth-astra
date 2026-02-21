"use client"

import { motion } from "framer-motion"
import { AlertCircle, Ban, FileQuestion } from "lucide-react"
import { Card } from "@/components/ui/card"

const problems = [
  {
    icon: FileQuestion,
    title: "Confused about eligibility?",
    description: "Banks reject without explaining what went wrong or how to improve.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Ban,
    title: "Fear of rejection?",
    description: "Multiple loan applications hurt your credit score and reduce approval chances.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: AlertCircle,
    title: "No credit history?",
    description: "450M+ Indians are locked out of financial services due to lack of credit records.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
]

export default function ProblemStatement() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">The Loan Application Problem</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Traditional loan platforms leave millions of Indians in the dark
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="p-8 h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
                <div className={`${problem.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <problem.icon className={`w-8 h-8 ${problem.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
