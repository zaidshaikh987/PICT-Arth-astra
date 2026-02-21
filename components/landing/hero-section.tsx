"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Shield, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const heroImages = [
  "/happy-indian-family-getting-home-loan-approval.jpg",
  "/young-indian-professional-checking-loan-eligibilit.jpg",
  "/indian-couple-meeting-bank-manager-for-loan.jpg",
  "/indian-businessman-reviewing-loan-documents.jpg",
  "/indian-woman-entrepreneur-getting-business-loan.jpg",
]

const floatingFeatures = [
  { icon: "🏠", label: "Home Loan", color: "from-blue-500 to-blue-600" },
  { icon: "🚗", label: "Car Loan", color: "from-blue-500 to-blue-600" },
  { icon: "💼", label: "Business Loan", color: "from-purple-500 to-purple-600" },
  { icon: "🎓", label: "Education Loan", color: "from-orange-500 to-orange-600" },
  { icon: "💳", label: "Personal Loan", color: "from-pink-500 to-pink-600" },
  { icon: "🏥", label: "Medical Loan", color: "from-red-500 to-red-600" },
]

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-700 min-h-screen">
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

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-10 font-normal text-center border-foreground">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Brand Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30"
            >
              <span className="text-2xl">💰</span>
              <span className="text-3xl font-bold text-card tracking-normal">ArthAstra  </span>
            </motion.div>

            {/* Main Headline - Updated tagline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Borrow{" "}
              <span className="text-yellow-300 relative">
                Smarter
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-yellow-300 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              , Not Harder
            </h1>

            {/* Subheadline - Removed "AI" from tagline */}
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl leading-relaxed">
              Intelligent loan guidance designed for every Indian borrower. Check eligibility in 60 seconds with{" "}
              <strong className="text-yellow-300">no credit score impact.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-50 px-8 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-full backdrop-blur-sm bg-transparent"
                >
                  Login
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Privacy-First</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">100% Free</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Image Carousel */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={heroImages[currentImage]}
                  alt="ArthAstra loan guidance"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? "bg-white w-6" : "bg-white/50"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl"
            >
              <div className="text-3xl font-bold text-blue-600">450M+</div>
              <div className="text-sm text-gray-600">Indians Served</div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <p className="text-white/80 text-center mb-6 text-lg">What type of loan are you looking for?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {floatingFeatures.map((feature, idx) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="cursor-pointer"
              >
                <Link href={`/onboarding?type=${feature.label.toLowerCase().replace(" ", "-")}`}>
                  <div
                    className={`bg-gradient-to-br ${feature.color} px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all`}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-white font-medium">{feature.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
