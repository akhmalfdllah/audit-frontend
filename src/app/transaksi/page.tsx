"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type Transaction = {
    id: string;
    title: string;
    category: string;
    amount: number;
    description: string;
    createdAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
};

type Log = {
    id: string;
    actorName: string;
    action: string;
    targetEntity: string;
    targetId: string;
    metadata: Record<string, string | number | boolean>;
    createdAt: string;
};

const actions = [
    "CREATE_TRANSACTION",
    "APPROVE_TRANSACTION",
    "REJECT_TRANSACTION",
];

export default function TransaksiPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" }>({
    key: "title",
    direction: "asc",
});
    const [logs, setLogs] = useState<Log[]>([]);
    const [selectedTab, setSelectedTab] = useState<"pending" | "by-action">("pending");
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<{
        show: boolean;
        id: string | null;
        decision: "APPROVED" | "REJECTED" | null;
    }>({
        show: false,
        id: null,
        decision: null,
    });

    // Fetch transaksi pending
    const fetchPendingTransactions = async () => {
        const res = await axios.get("/transactions/all");
        const pendingOnly = res.data.filter((tx: Transaction) => tx.status === "PENDING");
        setData(pendingOnly);
    };

    useEffect(() => {
        if (selectedTab === "pending") {
            fetchPendingTransactions();
        }
    }, [selectedTab]);

    // Fetch log berdasarkan action
    const fetchLogsByAction = async (action: string) => {
        const res = await axios.get(`/audit-logs/by-action/${action}`);
        setLogs(res.data);
    };

    useEffect(() => {
        if (selectedTab === "by-action" && selectedAction) {
            fetchLogsByAction(selectedAction);
        }
    }, [selectedAction, selectedTab]);

    // Handle sorting
    const handleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
};

const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
});


    // Handle approve/reject
    const handleActionConfirm = async () => {
        if (!confirmAction.id || !confirmAction.decision) return;
        try {
            await axios.put(`/transactions/${confirmAction.id}/approval`, {
                decision: confirmAction.decision,
            });
            fetchPendingTransactions();
        } catch (err) {
            console.error("Gagal approve/reject:", err);
        } finally {
            setConfirmAction({ show: false, id: null, decision: null });
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Daftar Transaksi</h1>

            {/* Tab Pilihan */}
            <div className="w-full">
                {/* Tombol Tab */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setSelectedTab("pending")}
                        className={`px-4 py-2 rounded-md font-medium border-b-7 transition-all duration-200 transform 
            ${selectedTab === "pending"
                                ? "bg-[#635d40] text-white border-[#f08c00] scale-105 shadow-md"
                                : "bg-gray-100 border-transparent hover:scale-105 hover:shadow-md hover:border hover:border-[#f08c00]"
                            }`}
                    >
                        Menunggu Validasi
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

                {/* Konten Tab dengan Animasi Geser */}
                <div className="relative w-full h-5 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                        >
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Tab Berdasarkan Action */}
            {selectedTab === "by-action" && (
                <>
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

                    <table className="w-full bg-white border-t border-gray-300 text-sm rounded-lg shadow-xl">
                        <thead className="bg-[#f08c00] text-white">
                            <tr>
                                <th className="px-4 py-2 border">Aktor</th>
                                <th className="px-4 py-2 border">Aksi</th>
                                <th className="px-4 py-2 border">Target</th>
                                <th className="px-4 py-2 border">Metadata</th>
                                <th className="px-4 py-2 border">Waktu</th>
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
                                        <td className="px-4 py-1 border">{log.actorName || "Sistem"}</td>
                                        <td className="px-4 py-1 border">{log.action}</td>
                                        <td className="px-4 py-1 border">
                                            {log.targetEntity} - {log.targetId}
                                        </td>
                                        <td className="px-4 py-1 border">
                                            {log.metadata?.title && <div>Title: {log.metadata.title}</div>}
                                            {log.metadata?.amount && (
                                                <div>Jumlah: Rp. {Number(log.metadata.amount).toLocaleString()}</div>
                                            )}
                                            {log.metadata?.decisionBy && (
                                                <div>Oleh: {log.metadata.decisionBy}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </>
            )}

            {/* Tab Pending */}
            {selectedTab === "pending" && (
    <table className="w-full border-gray-300 text-sm text-left rounded-lg">
        <thead className="bg-[#f2f2f2]">
            <tr>
                <th onClick={() => handleSort("title")} className="cursor-pointer px-4 py-2">
                    Judul {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("category")} className="cursor-pointer px-4 py-2">
                    Kategori {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-2">Deskripsi</th>
                <th onClick={() => handleSort("amount")} className="cursor-pointer px-4 py-2">
                    Nominal {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-2">Status</th>
                <th onClick={() => handleSort("createdAt")} className="cursor-pointer px-4 py-2">
                    Waktu {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
        </thead>
        <tbody>
                        {data.map((tx) => (
                            <tr key={tx.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{tx.title}</td>
                                <td className="px-4 py-2">{tx.category}</td>
                                <td className="px-4 py-2">{tx.description}</td>
                                <td className="px-4 py-2">Rp. {tx.amount.toLocaleString()}</td>
                                <td
                                    className={`px-4 py-2 font-medium ${tx.status === "PENDING"
                                        ? "text-yellow-600"
                                        : tx.status === "APPROVED"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {tx.status}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                            {new Date(tx.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {tx.status === "PENDING" && (
                                        <div className="space-x-2">
                                            <Button
                                                onClick={() =>
                                                    setConfirmAction({
                                                        show: true,
                                                        id: tx.id,
                                                        decision: "APPROVED",
                                                    })
                                                }
                                                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setConfirmAction({
                                                        show: true,
                                                        id: tx.id,
                                                        decision: "REJECTED",
                                                    })
                                                }
                                                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal Konfirmasi */}
            <AnimatePresence>
                {confirmAction.show && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className="text-lg font-bold mb-4">
                                {`Yakin ingin ${confirmAction.decision === "APPROVED"
                                    ? "menyetujui"
                                    : "menolak"
                                    } transaksi ini?`}
                            </h3>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleActionConfirm}
                                    className={`px-4 py-2 rounded text-white ${confirmAction.decision === "APPROVED"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    Ya
                                </button>
                                <button
                                    onClick={() =>
                                        setConfirmAction({ show: false, id: null, decision: null })
                                    }
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
