"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { OnboardingData } from "../types"
import { ArrowRight } from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export default function Step1BasicProfile({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectFailed, setDetectFailed] = useState(false)

  const getLanguageLabel = (code?: string) => {
    if (!code) return ""
    if (code === "hi") return "Hindi"
    if (code === "mr") return "Marathi"
    if (code === "ta") return "Tamil"
    if (code === "bn") return "Bengali"
    if (code === "en") return "English"
    return code
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.phone || data.phone.length < 6) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const payload: Partial<OnboardingData> = {}
      const storedCity = localStorage.getItem("detectedCity") || ""
      const storedRegion = localStorage.getItem("detectedRegion") || ""
      const storedLanguage = (localStorage.getItem("language") || "") as string

      if (!data.city && storedCity) {
        payload.city = storedCity
      }
      if (!data.state && storedRegion) {
        payload.state = storedRegion
      }
      if (!data.language && storedLanguage) {
        payload.language = storedLanguage as any
      }

      if (Object.keys(payload).length > 0) {
        updateData(payload)
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    const shouldDetect = !data.language || !data.city || !data.state

    if (!shouldDetect) {
      return
    }

    const detect = async () => {
      try {
        if (typeof window === "undefined") return
        setIsDetecting(true)
        setDetectFailed(false)

        const res = await fetch("https://ipapi.co/json/")
        if (!res.ok) {
          setIsDetecting(false)
          setDetectFailed(true)
          return
        }

        const json = await res.json()
        const payload: Partial<OnboardingData> = {}

        const cityFromIp = (json as any).city as string | undefined
        const regionFromIp = (json as any).region as string | undefined

        if (!data.city && (json as any).city) {
          payload.city = cityFromIp
        }
        if (!data.state && (json as any).region) {
          payload.state = regionFromIp
        }

        if (!data.language) {
          const langsRaw = ((json as any).languages as string | undefined) || ""
          const langs = langsRaw.toLowerCase()
          const regionLower = (regionFromIp || "").toLowerCase()

          let lang = "en"

          if (regionLower.includes("maharashtra")) {
            lang = "mr"
          } else if (langs.includes("hi")) {
            lang = "hi"
          } else if (langs.includes("mr")) {
            lang = "mr"
          } else if (langs.includes("ta")) {
            lang = "ta"
          } else if (langs.includes("bn")) {
            lang = "bn"
          }

          payload.language = lang
        }

        if (Object.keys(payload).length > 0) {
          updateData(payload)
        }
        setIsDetecting(false)
      } catch {
        setIsDetecting(false)
        setDetectFailed(true)
      }
    }

    detect()
  }, [data.city, data.state, data.language, updateData])

  return (
    <Card className="p-8 shadow-xl border-2 border-blue-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s Get Started</h2>
        <p className="text-gray-600">Enter your phone number to continue</p>
        {isDetecting && (
          <p className="text-xs text-blue-600 mt-2">Detecting your location and local language in real time...</p>
        )}
        {!isDetecting && (data.city || data.state || data.language) && (
          <p className="text-xs text-blue-700 mt-2">
            We detected {data.city || data.state ? `${data.city || ""}${data.city && data.state ? ", " : ""}${!data.city && data.state ? data.state : ""}` : "your location"}
            {data.language && ` • Most spoken language here: ${getLanguageLabel(data.language)}`}
          </p>
        )}
        {detectFailed && !data.city && !data.state && !data.language && (
          <p className="text-xs text-red-600 mt-2">Could not auto-detect your location. We&apos;ll start in English.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="phone" className="text-base font-semibold">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +919876543210"
            value={data.phone || ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="mt-2 h-12"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          {(data.city || data.state || data.language) && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs">
              <span className="font-semibold text-blue-700">Detected</span>
              <span className="text-blue-700">
                {(data.city || data.state) && (
                  <>
                    {data.city}
                    {data.city && data.state && ", "}
                    {!data.city && data.state}
                    {data.city && !data.state && ""}
                  </>
                )}
                {data.language && (
                  <>
                    {(data.city || data.state) && " • "}
                    {getLanguageLabel(data.language)}
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold group"
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  )
}
