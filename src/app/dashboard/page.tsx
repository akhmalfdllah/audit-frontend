"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/api"
import { FileText, CheckCircle, XCircle, Users } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { motion } from "framer-motion"

export default function DashboardPage() {
    const [summary, setSummary] = useState({
        totalTransactions: 0,
        approvedTransactions: 0,
        rejectedTransactions: 0,
        activeUsers: 0,
        inactiveUsers: 0,
    })

    useEffect(() => {
        axios.get("/dashboard/summary").then((res) => {
            setSummary(res.data)
        })
    }, [])

    const totalDecision =
        summary.approvedTransactions + summary.rejectedTransactions

    const pieData = [
        { name: "Disetujui", value: summary.approvedTransactions, color: "#f08c00" },
        { name: "Ditolak", value: summary.rejectedTransactions, color: "#635d40" },
    ]

    return (
        <div className="space-y-8">

            {/* ====================== */}
            {/*      STAT BOXES       */}
            {/* ====================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

                {/* Template Card Modern */}
                {[
                    {
                        title: "Total Transaksi",
                        value: summary.totalTransactions,
                        icon: FileText,
                        color: "from-[#f08c00]/20 to-[#f08c00]/5",
                        glow: "shadow-[0_0_20px_rgba(240,140,0,0.25)]",
                    },
                    {
                        title: "Sudah Diputuskan",
                        value: totalDecision,
                        icon: FileText,
                        color: "from-[#635d40]/20 to-[#635d40]/5",
                        glow: "shadow-[0_0_20px_rgba(99,93,64,0.25)]",
                    },
                    {
                        title: "Disetujui",
                        value: summary.approvedTransactions,
                        icon: CheckCircle,
                        color: "from-green-500/20 to-green-500/5",
                        glow: "shadow-[0_0_20px_rgba(34,197,94,0.25)]",
                    },
                    {
                        title: "Ditolak",
                        value: summary.rejectedTransactions,
                        icon: XCircle,
                        color: "from-red-500/20 to-red-500/5",
                        glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
                    },
                    {
                        title: "User Aktif",
                        value: summary.activeUsers,
                        icon: Users,
                        color: "from-green-600/20 to-green-600/5",
                        glow: "shadow-[0_0_20px_rgba(22,163,74,0.25)]",
                    },
                    {
                        title: "User Tidak Aktif",
                        value: summary.inactiveUsers,
                        icon: Users,
                        color: "from-red-600/20 to-red-600/5",
                        glow: "shadow-[0_0_20px_rgba(220,38,38,0.25)]",
                    },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 + i * 0.1 }}
                        className={`
                            bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 
                            p-4 flex items-start gap-3 ${item.glow} 
                            shadow-md hover:shadow-xl transition-all
                            bg-gradient-to-br ${item.color}
                        `}
                    >
                        <item.icon className="w-8 h-8 text-[#635d40]" />
                        <div>
                            <h2 className="font-semibold text-sm text-[#635d40]">
                                {item.title}
                            </h2>
                            <motion.p
                                className="text-2xl font-bold mt-1 text-[#635d40]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7 }}
                            >
                                {item.value}
                                {item.title === "Sudah Diputuskan" && (
                                    <span className="text-xs ml-1 text-gray-600">
                                        (Jumlah)
                                    </span>
                                )}
                            </motion.p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ====================== */}
            {/*       DONUT CHART     */}
            {/* ====================== */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-[#635d40] mb-4">
                    Statistik Persentase Transaksi
                </h2>

                <div className="w-full h-80">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="55%"
                                outerRadius="75%"
                                paddingAngle={4}
                                animationDuration={900}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
