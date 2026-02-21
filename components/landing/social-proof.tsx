"use client"

import { motion } from "framer-motion"
import { Star, TrendingUp, Users, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  {
    icon: Users,
    value: "450M+",
    label: "Indians Served",
    color: "text-blue-600",
  },
  {
    icon: DollarSign,
    value: "₹500Cr+",
    label: "Loans Enabled",
    color: "text-indigo-600",
  },
  {
    icon: Star,
    value: "4.8★",
    label: "User Rating",
    color: "text-cyan-600",
  },
  {
    icon: TrendingUp,
    value: "92%",
    label: "Success Rate",
    color: "text-blue-600",
  },
]

const testimonials = [
  {
    name: "Priya S.",
    location: "Mumbai",
    text: "I had no credit history and was rejected everywhere. ArthAstra showed me a clear path to build my score. 6 months later, I got my education loan!",
    rating: 5,
  },
  {
    name: "Rajesh K.",
    location: "Bangalore",
    text: "The scenario simulator was a game-changer. I realized waiting 2 months would save me ₹45,000 in interest!",
    rating: 5,
  },
  {
    name: "Anjali M.",
    location: "Delhi",
    text: "Finally, a platform that explains WHY I was rejected and HOW to fix it. No more guessing games!",
    rating: 5,
  },
]

export default function SocialProof() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:shadow-xl transition-shadow bg-white">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Success Stories</h2>
          <p className="text-xl text-gray-600">Real people, real results</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="p-6 h-full bg-white hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.location}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
