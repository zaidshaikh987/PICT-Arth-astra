import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/lib/language-context"
import { VoiceAssistantProvider } from "@/lib/voice-assistant-context"
import VoiceAssistantButton from "@/components/voice-assistant-button"

import GlobalChatbot from "@/components/global-chatbot"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ArthAstra - Borrow Smarter, Not Harder",
  description:
    "Check loan eligibility in 60 seconds. Get personalized guidance. Apply with confidence. No credit score impact.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <VoiceAssistantProvider>
            {children}
            <VoiceAssistantButton />
            <GlobalChatbot />
            <Toaster />
            <Analytics />
          </VoiceAssistantProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
