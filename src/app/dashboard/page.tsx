"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/api"
import { FileText, CheckCircle, XCircle, UserCheck } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts"
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

    const barData = [
        { name: "Disetujui", value: summary.approvedTransactions, fill: "#f08c00" },
        { name: "Ditolak", value: summary.rejectedTransactions, fill: "#635d40" },
    ]

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#635d40]">Dashboard</h1>
                <p className="text-sm text-gray-500">Ringkasan aktivitas audit</p>
            </div>

            {/* Summary Card GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

                {/* Universal Card Template */}
                {[
                    {
                        label: "Total Transaksi",
                        value: summary.totalTransactions,
                        icon: <FileText className="w-7 h-7 text-[#f08c00]" />,
                        delay: 0.1
                    },
                    {
                        label: "Diputuskan",
                        value: totalDecision,
                        icon: <FileText className="w-7 h-7 text-blue-600" />,
                        delay: 0.15
                    },
                    {
                        label: "Disetujui",
                        value: summary.approvedTransactions,
                        icon: <CheckCircle className="w-7 h-7 text-green-600" />,
                        delay: 0.2
                    },
                    {
                        label: "Ditolak",
                        value: summary.rejectedTransactions,
                        icon: <XCircle className="w-7 h-7 text-red-600" />,
                        delay: 0.25
                    },
                    {
                        label: "User Aktif",
                        value: summary.activeUsers,
                        icon: <UserCheck className="w-7 h-7 text-green-600" />,
                        delay: 0.3
                    },
                    {
                        label: "User Nonaktif",
                        value: summary.inactiveUsers,
                        icon: <UserCheck className="w-7 h-7 text-red-500" />,
                        delay: 0.35
                    },
                ].map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: card.delay }}
                        className="
                            p-4 rounded-2xl bg-white/60 
                            backdrop-blur-lg border shadow-sm 
                            hover:shadow-md hover:-translate-y-1 
                            transition-all cursor-default
                        "
                    >
                        <div className="flex items-start gap-3">
                            {card.icon}
                            <div>
                                <h2 className="font-semibold text-sm text-[#635d40]">{card.label}</h2>
                                <p className="text-2xl font-bold mt-1 text-gray-800">
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart Container */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="
                    bg-white/70 backdrop-blur-lg 
                    p-6 rounded-2xl border shadow-sm
                "
            >
                <h2 className="text-lg font-semibold text-[#635d40] mb-4">
                    Grafik Status Transaksi
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Jumlah" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    )
}
