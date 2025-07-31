"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/api"
import { FileText, CheckCircle, XCircle, UserCheck } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts"
import { motion } from "framer-motion"
import Layout from "@/components/Layout"

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

    const barData = [
        { name: "Disetujui", value: summary.approvedTransactions, fill: "#f08c00" }, // oranye
        { name: "Ditolak", value: summary.rejectedTransactions, fill: "#635d40" },  // coklat tua
    ]

    return (
        <Layout>
            <div>
                <h1 className="text-2xl font-bold mb-6 text-[#635d40]">Dashboard</h1>

                {/* Box Ringkasan */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-[#635d40] mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 h-full"
                    >
                        <FileText className="w-7 h-7 text-[#f08c00]" />
                        <div>
                            <h2 className="font-semibold text-base">Total Transaksi</h2>
                            <p className="text-xl mt-1">{summary.totalTransactions}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 h-full"
                    >
                        <CheckCircle className="w-7 h-7 text-green-600" />
                        <div>
                            <h2 className="font-semibold text-base">Disetujui</h2>
                            <p className="text-xl mt-1">{summary.approvedTransactions}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 h-full"
                    >
                        <XCircle className="w-7 h-7 text-red-600" />
                        <div>
                            <h2 className="font-semibold text-base">Ditolak</h2>
                            <p className="text-xl mt-1">{summary.rejectedTransactions}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 h-full"
                    >
                        <UserCheck className="w-7 h-7 text-green-600" />
                        <div>
                            <h2 className="font-semibold text-base">User Aktif</h2>
                            <p className="text-xl mt-1">{summary.activeUsers}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="p-3 rounded-xl bg-white border shadow-sm flex items-start gap-3 h-full"
                    >
                        <UserCheck className="w-7 h-7 text-red-500" />
                        <div>
                            <h2 className="font-semibold text-base">User Inactive</h2>
                            <p className="text-xl mt-1">{summary.inactiveUsers}</p>
                        </div>
                    </motion.div>
                </div>


                {/* Bar Chart */}
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-semibold text-[#635d40] mb-4">Grafik Status Transaksi</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Jumlah" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Layout>
    )
}
