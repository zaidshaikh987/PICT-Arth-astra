"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, CheckCheck, CreditCard, Clock, TrendingDown, Lightbulb, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

type Alert = {
    _id: string
    type: string
    title: string
    message: string
    severity: string
    read: boolean
    createdAt: string
}

const typeIcons: Record<string, any> = {
    credit_score_change: CreditCard,
    drop_off: Clock,
    emi_reminder: TrendingDown,
    spending_insight: Lightbulb,
    system: Info,
}

const severityColors: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-red-50 border-red-200 text-red-800",
}

const severityDot: Record<string, string> = {
    info: "bg-blue-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
}

export default function NotificationCenter() {
    const [open, setOpen] = useState(false)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    // Fetch alerts
    const fetchAlerts = async () => {
        try {
            const res = await fetch("/api/alerts")
            if (!res.ok) return
            const data = await res.json()
            setAlerts(data.alerts || [])
            setUnreadCount(data.unreadCount || 0)
        } catch { }
    }

    // Generate alerts on mount (light check)
    useEffect(() => {
        fetch("/api/alerts/generate", { method: "POST" })
            .then(() => fetchAlerts())
            .catch(() => fetchAlerts())
    }, [])

    // Poll every 30s
    useEffect(() => {
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [])

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    const markAsRead = async (alertId: string) => {
        await fetch("/api/alerts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alertId }),
        })
        setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, read: true } : a))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllRead = async () => {
        await fetch("/api/alerts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAll: true }),
        })
        setAlerts(prev => prev.map(a => ({ ...a, read: true })))
        setUnreadCount(0)
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return "Just now"
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-96 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg" aria-label="Close notifications">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Alert List */}
                    <div className="flex-1 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Bell className="w-8 h-8 mb-2 opacity-40" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            alerts.map((alert) => {
                                const Icon = typeIcons[alert.type] || Info
                                return (
                                    <div
                                        key={alert._id}
                                        onClick={() => !alert.read && markAsRead(alert._id)}
                                        className={`px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!alert.read ? "bg-blue-50/40" : ""
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${severityColors[alert.severity] || severityColors.info}`}>
                                                <Icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    {!alert.read && (
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[alert.severity] || severityDot.info}`} />
                                                    )}
                                                    <h4 className={`text-sm font-semibold text-gray-900 truncate ${!alert.read ? "" : "opacity-70"}`}>
                                                        {alert.title}
                                                    </h4>
                                                </div>
                                                <p className={`text-xs text-gray-600 line-clamp-2 ${!alert.read ? "" : "opacity-60"}`}>
                                                    {alert.message}
                                                </p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">
                                                    {timeAgo(alert.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
