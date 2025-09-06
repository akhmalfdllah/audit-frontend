"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/api"
import AdminPage from "@/components/protected-routes/AdminPage"


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
    "CREATE_GROUP",
    "UPDATE_GROUP",
    "DELETE_GROUP",
]

export default function AuditLogPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [selectedTab, setSelectedTab] = useState<"semua" | "by-action">("semua")
    const [selectedAction, setSelectedAction] = useState<string>("")
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [allActionLogs, setAllActionLogs] = useState<Log[]>([]);

    const fetchLogsByAction = async (action: string) => {
        const res = await axios.get(`/audit-logs/by-action/${action}`);
        setAllActionLogs(res.data);
        setPage(1);
    };

    useEffect(() => {
        if (selectedTab === "by-action") {
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            setLogs(allActionLogs.slice(startIndex, endIndex));
        }
    }, [page, allActionLogs, selectedTab]);

    const fetchAllLogs = useCallback(async () => {
        const offset = (page - 1) * 10;
        const res = await axios.get(`/audit-logs/paginated?offset=${offset}&limit=10`);
        const filteredLogs = res.data.data.filter((log: Log) =>
            actions.includes(log.action)
        );
        setLogs(filteredLogs);
        setHasMore(res.data.hasMore);
    }, [page]);

    useEffect(() => {
        if (selectedTab === "semua") {
            fetchAllLogs()
        }
    }, [selectedTab, page, fetchAllLogs])

    useEffect(() => {
        if (selectedTab === "by-action" && selectedAction) {
            fetchLogsByAction(selectedAction)
        }
    }, [selectedAction, selectedTab])

    return (
        <AdminPage>
            <div>
                {/* Tab */}
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

                {/* Dropdown By-Action */}
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
                                <option key={act} value={act}>{act}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Tabel Log */}
                <div className="overflow-x-auto min-h-[410px]">
                    <table className="w-full border-gray-300 text-sm text-left rounded-lg">
                        <thead className="bg-[#f2f2f2]">
                            <tr>
                                <th className="px-4 py-2">Aktor</th>
                                <th className="px-4 py-2">Aksi</th>
                                <th className="px-4 py-2">Target</th>
                                <th className="px-4 py-2">Metadata</th>
                                <th className="px-4 py-2">Waktu</th>
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

                {/* Pagination By-Action */}
                {selectedTab === "by-action" && (
                    <div className="flex justify-center mt-6 gap-4 items-center">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <span className="px-4 py-1 text-sm font-medium">
                            Halaman {page}
                        </span>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={page * 10 >= allActionLogs.length}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                )}

                {/* Pagination Semua Log */}
                {selectedTab === "semua" && (
                    <div className="flex justify-center mt-6 gap-2 items-center">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <span className="px-4 py-1 text-sm font-medium">Halaman {page}</span>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!hasMore}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                )}
            </div>
        </AdminPage>
    )
}
