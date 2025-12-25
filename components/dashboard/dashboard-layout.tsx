"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  TrendingUp,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  ShieldX,
  FileCheck,
  Goal,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    title: "YOUR APPLICATION",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Application Timeline", href: "/dashboard/timeline", icon: Calendar },
      { name: "Document Checklist", href: "/dashboard/documents", icon: FileCheck },
      { name: "Eligibility Report", href: "/dashboard/eligibility", icon: FileText },
    ]
  },
  {
    title: "TOOLS",
    items: [
      { name: "Loan Comparison", href: "/dashboard/loans", icon: TrendingUp },
      { name: "Credit Path Optimizer", href: "/dashboard/optimizer", icon: Target },
      { name: "Multi-Goal Planner", href: "/dashboard/multi-goal", icon: Goal },
    ]
  },
  {
    title: "SUPPORT",
    items: [
      { name: "Rejection Recovery", href: "/dashboard/rejection-recovery", icon: ShieldX },
      { name: "Peer Insights", href: "/dashboard/peers", icon: Users },
      { name: "AI Assistant", href: "/dashboard/chat", icon: MessageSquare },
    ]
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const session = localStorage.getItem("arthAstraSession")
    if (!session) {
      window.location.href = "/login"
    }

    // Trigger Welcome Notification if not sent
    // Trigger Global Notifications
    const checkAndNotify = async () => {
      const dataStr = localStorage.getItem("onboardingData")
      if (!dataStr) return

      const userData = JSON.parse(dataStr)
      if (!userData.phone) return

      const simState = JSON.parse(localStorage.getItem("timelineSimulation") || "{}")
      const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "{}")
      const fileCount = Object.keys(uploadedFiles).length

      const notify = async (stage: string) => {
        if (simState[`notified_${stage}`]) return

        console.log(`[Dashboard] Attempting to notify for ${stage}...`)
        try {
          const res = await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stage,
              userData: {
                name: userData.name,
                phone: userData.phone,
                creditScore: userData.creditScore || 750
              }
            })
          })
          const data = await res.json()

          if (data.success) {
            console.log(`[Dashboard] ${stage} success.`)
            simState[`notified_${stage}`] = true
            localStorage.setItem("timelineSimulation", JSON.stringify(simState))
          }
        } catch (err) {
          console.error(`[Dashboard] ${stage} error:`, err)
        }
      }

      // 1. Profile Setup (Immediate)
      await notify("profile_setup")

      // 2. Documents Uploaded (If at least 1 file)
      if (fileCount > 0) {
        await notify("docs_uploaded")

        // Start Credit Check Timer if not started
        if (!simState.creditCheckStarted) {
          simState.creditCheckStarted = Date.now()
          localStorage.setItem("timelineSimulation", JSON.stringify(simState))
        }
      }

      // 3. Credit Check (5s after docs)
      if (simState.creditCheckStarted) {
        const elapsed = Date.now() - simState.creditCheckStarted
        if (elapsed > 5000) {
          await notify("credit_check_started")

          // Mark finished status for UI (simulated)
          if (elapsed > 10000 && !simState.creditCheckCompleted) {
            simState.creditCheckCompleted = true
            localStorage.setItem("timelineSimulation", JSON.stringify(simState))
          }
        }
        if (elapsed > 15000) {
          await notify("credit_check_completed")
        }
      }

      // 4. Lender Matches (20s after docs)
      if (simState.creditCheckCompleted) {
        const elapsed = Date.now() - simState.creditCheckStarted
        if (elapsed > 25000) {
          await notify("lender_match_found")
        }
      }
    }

    // Check periodically (every 5 seconds) to catch time-based events
    const interval = setInterval(checkAndNotify, 5000)
    checkAndNotify() // Also run immediately

    return () => clearInterval(interval)
  }, [pathname]) // Re-check on route change

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-emerald-600 hover:bg-emerald-700"
          size="icon"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ArthAstra</span>
            </Link>
          </div>

          {/* Navigation - Grouped */}
          <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
            {navigation.map((group, groupIdx) => (
              <div key={group.title}>
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions - Removed language toggle */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (confirm("Are you sure you want to logout? (Your data will be saved)")) {
                  localStorage.removeItem("arthAstraSession")
                  window.location.href = "/"
                }
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="p-6 lg:p-10 max-w-[1600px]">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
