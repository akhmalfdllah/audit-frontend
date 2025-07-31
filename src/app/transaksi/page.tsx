"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/api"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"

type Transaction = {
    id: string
    title: string
    category: string
    amount: number
    description: string
    status: "PENDING" | "APPROVED" | "REJECTED"
}


export default function TransaksiPage() {
    const [data, setData] = useState<Transaction[]>([])

    const fetchData = async () => {
        const res = await axios.get("/transactions/all")
        setData(res.data)
    }

    const handleAction = async (id: string, decision: "APPROVED" | "REJECTED") => {
        try {
            await axios.put(`/transactions/${id}/approval`, { decision })
            fetchData()
        } catch (err) {
            console.error("Gagal approve/reject:", err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <Layout>
            <div>
                <h1 className="text-2xl font-bold mb-4">Daftar Transaksi</h1>

                <div className="space-y-4">
                    {data.map((tx) => (
                        <div
                            key={tx.id}
                            className="p-4 rounded-lg bg-white border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
                        >
                            <div className="space-y-1">
                                <h2 className="font-semibold text-lg">{tx.title}</h2>
                                <p className="text-sm text-gray-600">Kategori: {tx.category}</p>
                                <p className="text-sm italic text-gray-500">{tx.description}</p>
                                <p className="text-sm">Nominal: Rp {tx.amount.toLocaleString()}</p>
                                <p className="text-sm">
                                    Status:{" "}
                                    <span
                                        className={
                                            tx.status === "PENDING"
                                                ? "text-yellow-600"
                                                : tx.status === "APPROVED"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                        }
                                    >
                                        {tx.status}
                                    </span>
                                </p>
                            </div>

                            {tx.status === "PENDING" && (
                                <div className="mt-4 md:mt-0 space-x-2">
                                    <Button onClick={() => handleAction(tx.id, "APPROVED")} className="bg-green-600 hover:bg-green-700">
                                        Approve
                                    </Button>
                                    <Button onClick={() => handleAction(tx.id, "REJECTED")} className="bg-red-600 hover:bg-red-700">
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}
