"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"

export function FinancialHealthChart({ userData }: { userData: any }) {
    const monthlyIncome = Number(userData.monthlyIncome) || 0
    const existingEMI = Number(userData.existingEMI) || 0
    const disposable = Math.max(0, monthlyIncome - existingEMI)

    const data = [
        { name: "Existing EMI", value: existingEMI, color: "#f43f5e" }, // Rose 500
        { name: "Disposable Income", value: disposable, color: "#3b82f6" }, // blue-500
    ]

    const total = monthlyIncome
    const dti = total > 0 ? Math.round((existingEMI / total) * 100) : 0

    return (
        <Card className="p-6 h-full flex flex-col justify-between shadow-lg border-gray-100">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Financial Health</h3>
                <p className="text-sm text-gray-500">Income vs Obligations</p>
            </div>

            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">{dti}%</span>
                    <span className="text-xs text-gray-500">DTI Ratio</span>
                </div>
            </div>

            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
}
