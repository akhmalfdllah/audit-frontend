"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "@/lib/api"

type Log = {
    id: string
    actorName: string
    action: string
    targetEntity: string
    targetId: string
    metadata: Record<string, string | number | boolean>
    createdAt: string
}

const actions = [
    "CREATE_USER",
    "UPDATE_USER",
    "DELETE_USER",
    "SIGNOUT",
    "SIGNIN",
    "CREATE_TRANSACTION",
    "APPROVE_TRANSACTION",
    "REJECT_TRANSACTION",
    "CREATE_GROUP",
    "UPDATE_GROUP",
    "DELETE_GROUP",
]

export default function AuditLogPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [selectedTab, setSelectedTab] = useState<"semua" | "by-action">("semua")
    const [selectedAction, setSelectedAction] = useState<string>("")
    const [page, setPage] = useState(1)

    const fetchLogsByAction = async (action: string) => {
        const res = await axios.get(`/audit-logs/by-action/${action}`)
        setLogs(res.data)
    }

    useEffect(() => {
        setLogs([])
        setPage(1)
    }, [selectedTab])

    const fetchAllLogs = useCallback(async () => {
        const res = await axios.get(`/audit-logs?page=${page}`);
        setLogs(res.data);
    }, [page]);

    useEffect(() => {
        if (selectedTab === "semua") {
            fetchAllLogs();
        }
    }, [selectedTab, page, fetchAllLogs]);

    useEffect(() => {
        if (selectedTab === "by-action" && selectedAction) {
            fetchLogsByAction(selectedAction)
        }
    }, [selectedAction, selectedTab])

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-[#635d40]">Audit Log</h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => {
                        setSelectedTab("semua");
                        setSelectedAction("");
                    }}
                    className={`px-4 py-2 rounded-md font-medium border-b-7 transition-all duration-200 transform
      ${selectedTab === "semua"
                            ? "bg-[#635d40] text-white border-[#f08c00] scale-105 shadow-md"
                            : "bg-gray-100 border-transparent hover:scale-105 hover:shadow-md hover:border hover:border-[#f08c00]"
                        }`}
                >
                    Semua Log
                </button>
                <button
                    onClick={() => setSelectedTab("by-action")}
                    className={`px-4 py-2 rounded-md font-medium border-b-7 transition-all duration-200 transform
      ${selectedTab === "by-action"
                            ? "bg-[#635d40] text-white border-[#f08c00] scale-105 shadow-md"
                            : "bg-gray-100 border-transparent hover:scale-105 hover:shadow-md hover:border hover:border-[#f08c00]"
                        }`}
                >
                    Berdasarkan Action
                </button>
            </div>

            {selectedTab === "by-action" && (
                <div className="mb-6">
                    <label className="font-medium mr-2">Pilih Action:</label>
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="">-- Pilih Action --</option>
                        {actions.map((act) => (
                            <option key={act} value={act}>
                                {act}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-gray-300 text-sm text-left rounded-lg">
                    <thead className="bg-[#f2f2f2]">
                        <tr>
                            <th className="px-4 py-2 text-left">Aktor</th>
                            <th className="px-4 py-2 text-left">Aksi</th>
                            <th className="px-4 py-2 text-left">Target</th>
                            <th className="px-4 py-2 text-left">Metadata</th>
                            <th className="px-4 py-2 text-left">Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                                    Tidak ada log yang tersedia.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{log.actorName || "Sistem"}</td>
                                    <td className="px-4 py-2">{log.action}</td>
                                    <td className="px-4 py-2">{log.targetEntity} - {log.targetId}</td>
                                    <td className="px-4 py-2">
                                        {log.metadata?.title && <div>Title: {log.metadata.title}</div>}
                                        {log.metadata?.amount && <div>Jumlah: Rp {Number(log.metadata.amount).toLocaleString()}</div>}
                                        {log.metadata?.decisionBy && <div>Oleh: {log.metadata.decisionBy}</div>}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTab === "semua" && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="px-4 py-1 text-sm font-medium">Halaman {page}</span>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    )
}