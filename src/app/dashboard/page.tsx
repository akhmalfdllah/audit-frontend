"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/api"
import Layout from "@/components/Layout"

export default function DashboardPage() {
    const [jumlahTransaksi, setJumlahTransaksi] = useState(0)

    useEffect(() => {
        axios.get("/transactions/all").then((res) => {
            setJumlahTransaksi(res.data.length)
        })
    }, [])

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border shadow-sm">
                    <h2 className="font-semibold text-lg text-gray-700">Transaksi Masuk</h2>
                    <p className="text-sm mt-2 text-gray-600">Total: {jumlahTransaksi} transaksi</p>
                </div>
            </div>
        </Layout>
    )
}
