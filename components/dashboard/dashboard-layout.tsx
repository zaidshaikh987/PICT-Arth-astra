"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  ShieldX,
  FileCheck,
  Goal,
  BookOpen,
  Trophy,
  ChevronRight,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { UserProvider, useUser } from "@/lib/user-context"
import NotificationCenter from "@/components/dashboard/notification-center"
import EducationPolicyBar from "@/components/dashboard/education-policy-bar"
import { useLanguage } from "@/lib/language-context"

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: "" },
      { name: "Timeline", href: "/dashboard/timeline", icon: Calendar, badge: "" },
    ]
  },
  {
    title: "APPLICATION",
    items: [
      { name: "Documents", href: "/dashboard/documents", icon: FileCheck, badge: "" },
      { name: "Eligibility", href: "/dashboard/eligibility", icon: FileText, badge: "" },
      { name: "Loan Offers", href: "/dashboard/loans", icon: TrendingUp, badge: "NEW" },
    ]
  },
  {
    title: "LEARN",
    items: [
      { name: "Knowledge Hub", href: "/dashboard/learn", icon: BookOpen, badge: "" },
      { name: "Finance Quiz", href: "/dashboard/quiz", icon: Trophy, badge: "" },
    ]
  },
  {
    title: "AI TOOLS",
    items: [
      { name: "Credit Optimizer", href: "/dashboard/optimizer", icon: Target, badge: "" },
      { name: "Goal Planner", href: "/dashboard/multi-goal", icon: Goal, badge: "" },
      { name: "Recovery Agent", href: "/dashboard/rejection-recovery", icon: ShieldX, badge: "AI" },
    ]
  },
]

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading } = useUser()
  const { language, setLanguage } = useLanguage()

  const pathname = usePathname()

  const currentPage = navigation
    .flatMap(g => g.items)
    .find(item => item.href === pathname)?.name || "Dashboard"

  const userName = user?.name || "User"
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  if (!loading && !user) {
    window.location.href = "/login"
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      document.cookie = "userId=; path=/; max-age=0"
      window.location.href = "/"
    }
  }

  const sidebarWidth = sidebarCollapsed ? "w-[68px]" : "w-[250px]"
  const contentPadding = sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[250px]"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${sidebarWidth} bg-slate-900 transform transition-all duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`px-3 py-3 border-b border-slate-800 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/" className="flex items-center">
              {sidebarCollapsed ? (
                <Image
                  src="/arthastra-logo.png"
                  alt="ArthAstra"
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain"
                />
              ) : (
                <Image
                  src="/arthastra-logo.png"
                  alt="ArthAstra"
                  width={200}
                  height={66}
                  className="h-14 w-auto object-contain object-left"
                  priority
                />
              )}
            </Link>
            {/* Collapse toggle — desktop only */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <div className="px-2 py-2 border-b border-slate-800">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full flex items-center justify-center p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.title}>
                {!sidebarCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                    {group.title}
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="w-full border-t border-slate-800 my-2" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${sidebarCollapsed ? "justify-center" : ""} ${isActive
                          ? "bg-indigo-500/15 text-indigo-400"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        title={sidebarCollapsed ? item.name : ""}
                      >
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />}
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge === "AI" ? "bg-purple-500/20 text-purple-400" : item.badge === "NEW" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-slate-800 space-y-0.5">
            <Link href="/dashboard/settings">
              <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`} title={sidebarCollapsed ? "Settings" : ""}>
                <Settings className="w-4 h-4 text-slate-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
              title={sidebarCollapsed ? "Logout" : ""}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Top Header Bar ─── */}
      <header className={`${contentPadding} fixed top-0 right-0 left-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-200`}>
        <div className="flex items-center justify-between h-14 px-4 lg:px-8">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              {currentPage !== "Dashboard" && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="font-semibold text-slate-800">{currentPage}</span>
                </>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* AI Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">AI Active</span>
            </div>

            <NotificationCenter />

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
                <button
                  onClick={() => setLanguage("en")}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${language === "en" ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${language === "hi" ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage("mr")}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${language === "mr" ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <div className="w-px h-7 bg-slate-200 mx-1 hidden md:block" />

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center ring-2 ring-slate-200">
                <span className="text-white text-[9px] font-bold">{userInitials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
                <p className="text-[9px] text-slate-400 leading-tight">Personal Account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className={`${contentPadding} pt-14 transition-all duration-200`}>
        <div className="p-5 lg:p-8 max-w-[1600px]">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <EducationPolicyBar />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardInner>{children}</DashboardInner>
    </UserProvider>
  )
}
