"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "@/lib/api"
import Layout from "@/components/Layout"

type LogMetadata = {
    title?: string;
    amount?: number;
    decisionBy?: string;
};

type Log = {
    id: string
    actorName: string
    action: string
    targetEntity: string
    targetId: string
    metadata: LogMetadata
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
        <Layout>
            <h1 className="text-2xl font-bold mb-4 text-[#635d40]">Audit Log</h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => {
                        setSelectedTab("semua")
                        setSelectedAction("")
                    }}
                    className={`px-4 py-2 rounded-md font-medium ${selectedTab === "semua"
                        ? "bg-[#f08c00] text-white"
                        : "bg-gray-100"
                        }`}
                >
                    Semua Log
                </button>
                <button
                    onClick={() => setSelectedTab("by-action")}
                    className={`px-4 py-2 rounded-md font-medium ${selectedTab === "by-action"
                        ? "bg-[#f08c00] text-white"
                        : "bg-gray-100"
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

            <div className="space-y-3">
                {logs.length === 0 && (
                    <p className="text-sm text-gray-500">Tidak ada log yang tersedia.</p>
                )}

                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="p-4 bg-white border rounded-md shadow-sm text-sm text-[#635d40]"
                    >
                        <p>
                            <span className="font-semibold">{log.actorName || "Sistem"}</span>{" "}
                            melakukan{" "}
                            <span className="font-medium">{log.action}</span>
                        </p>

                        <p>Target: {log.targetEntity} - {log.targetId}</p>

                        {/* Tambahan metadata */}
                        {log.metadata?.title && (
                            <p>Title: <span className="font-medium">{log.metadata.title}</span></p>
                        )}
                        {log.metadata?.amount && (
                            <p>Jumlah: <span className="font-medium">Rp {log.metadata.amount.toLocaleString()}</span></p>
                        )}
                        {log.metadata?.decisionBy && (
                            <p>Disetujui/Ditolak oleh: <span className="font-medium">{log.metadata.decisionBy}</span></p>
                        )}

                        <p className="text-xs text-gray-500">
                            Waktu: {new Date(log.createdAt).toLocaleString()}
                        </p>

                    </div>
                ))}



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

        </Layout>
    )
}