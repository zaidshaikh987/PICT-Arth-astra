"use client"
import { useEffect } from "react"
import HeroSection from "@/components/landing/hero-section"
import ProblemStatement from "@/components/landing/problem-statement"
import FeaturesOverview from "@/components/landing/features-overview"
import HowItWorks from "@/components/landing/how-it-works"
import SocialProof from "@/components/landing/social-proof"
import CallToAction from "@/components/landing/cta-section"

export default function HomePage() {
  // Hackathon Persistence: Auto-login if profile exists
  // Auto-login removed to support manual Login flow


  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemStatement />
      <FeaturesOverview />
      <HowItWorks />
      <SocialProof />
      <CallToAction />
    </main>
  )
}
