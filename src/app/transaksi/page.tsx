"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/api";
import AuditorPage from "@/components/protected-routes/AuditorPage";
import { Button } from "@/components/ui/button";

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

const actions = ["CREATE_TRANSACTION", "APPROVE_TRANSACTION", "REJECT_TRANSACTION"];

type SortKey = "title" | "category" | "amount" | "createdAt";

export default function TransaksiPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [selectedTab, setSelectedTab] = useState<"pending" | "by-action">("pending");
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [notification, setNotification] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [logPage, setLogPage] = useState(1);
    const logsPerPage = 10;
    const [confirmAction, setConfirmAction] = useState<{
        show: boolean;
        id: string | null;
        decision: "APPROVED" | "REJECTED" | null;
    }>({
        show: false,
        id: null,
        decision: null,
    });

    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: "",
        end: "",
    });

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

    const fetchLogsByAction = async (action: string) => {
        const res = await axios.get(`/audit-logs/by-action/${action}`);
        setLogs(res.data);
    };

    useEffect(() => {
        if (selectedTab === "by-action" && selectedAction) {
            fetchLogsByAction(selectedAction);
        }
    }, [selectedAction, selectedTab]);

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: "asc" };
            return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        });
    };

    const sortedData = useMemo(() => {
        if (selectedTab !== "pending") return data;
        if (!sortConfig) return data;
        const arr = [...data];
        const { key, direction } = sortConfig;
        arr.sort((a, b) => {
            let aVal: string | number = a[key] as any;
            let bVal: string | number = b[key] as any;
            if (key === "createdAt") {
                aVal = new Date(a.createdAt).getTime();
                bVal = new Date(b.createdAt).getTime();
            }
            if (typeof aVal === "number" && typeof bVal === "number") {
                return direction === "asc" ? aVal - bVal : bVal - aVal;
            }
            return direction === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
        return arr;
    }, [data, sortConfig, selectedTab]);

    const sortedLogs = useMemo(() => {
        let filteredLogs = [...logs];
        if (dateRange.start || dateRange.end) {
            filteredLogs = filteredLogs.filter((log) => {
                const logDate = new Date(log.createdAt).getTime();
                const startDate = dateRange.start ? new Date(dateRange.start).getTime() : null;
                const endDate = dateRange.end ? new Date(dateRange.end).getTime() : null;
                return (
                    (!startDate || logDate >= startDate) &&
                    (!endDate || logDate <= endDate + 86400000 - 1)
                );
            });
        }
        if (sortConfig?.key === "createdAt") {
            filteredLogs.sort((a, b) => {
                const aVal = new Date(a.createdAt).getTime();
                const bVal = new Date(b.createdAt).getTime();
                return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
            });
        }
        return filteredLogs;
    }, [logs, sortConfig, dateRange]);

    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, page]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (logPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return sortedLogs.slice(startIndex, endIndex);
    }, [sortedLogs, logPage]);

    const handleActionConfirm = async () => {
        if (!confirmAction.id || !confirmAction.decision) return;
        try {
            await axios.put(`/transactions/${confirmAction.id}/approval`, {
                decision: confirmAction.decision,
            });
            fetchPendingTransactions();
            setNotification(
                confirmAction.decision === "APPROVED"
                    ? "Transaksi berhasil disetujui!"
                    : "Transaksi berhasil ditolak!"
            );
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            console.error("Gagal approve/reject:", err);
        } finally {
            setConfirmAction({ show: false, id: null, decision: null });
        }
    };

    const SortIcon = ({ active, direction }: { active: boolean; direction: "asc" | "desc" }) => (
        <svg
            viewBox="0 0 24 24"
            className={`ml-1 inline h-4 w-4 transition-all duration-200 ${active ? "" : "opacity-40 group-hover:opacity-70"
                } ${active && direction === "asc" ? "rotate-180" : ""}`}
            aria-hidden
        >
            <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <AuditorPage>
            <div>
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-20 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
                        >
                            {notification}
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Tab */}
                <div className="flex gap-6 mb-2">
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

                {/* Tab By Action */}
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

                        {/* Filter Tanggal dengan Kalender */}
                        <div className="flex gap-4 mt-4 mb-4">
                            <div>
                                <label className="font-medium mr-2">Dari:</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, start: e.target.value })
                                    }
                                    className="p-2 border rounded focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none"
                                />
                            </div>
                            <div>
                                <label className="font-medium mr-2">Sampai:</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, end: e.target.value })
                                    }
                                    className="p-2 border rounded focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto h-[410px]">
                            <table className="w-full border-gray-300 text-sm text-left rounded-lg">
                                <thead className="bg-[#f2f2f2]">
                                    <tr>
                                        <th className="px-4 py-2">Aktor</th>
                                        <th className="px-4 py-2">Aksi</th>
                                        <th className="px-4 py-2">Target</th>
                                        <th className="px-4 py-2">Metadata</th>
                                        <th
                                            className="px-4 py-2 cursor-pointer select-none group"
                                            onClick={() => handleSort("createdAt")}
                                        >
                                            <span className="inline-flex items-center">
                                                Waktu
                                                <SortIcon
                                                    active={sortConfig?.key === "createdAt"}
                                                    direction={sortConfig?.direction || "asc"}
                                                />
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                                                Tidak ada log yang tersedia.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedLogs.map((log) => (
                                            <tr key={log.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-2">{log.actorName || "Sistem"}</td>
                                                <td className="px-4 py-2">{log.action}</td>
                                                <td className="px-4 py-2">
                                                    {log.targetEntity} - {log.targetId}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {log.metadata?.title && <div>Title: {log.metadata.title}</div>}
                                                    {log.metadata?.amount && (
                                                        <div>Jumlah: Rp. {Number(log.metadata.amount).toLocaleString()}</div>
                                                    )}
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
                        {/* Pagination Tab By-Action */}
                        {selectedTab === "by-action" && (
                            <div className="flex justify-center mt-6 gap-4 items-center">
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => setLogPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={logPage === 1}
                                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </motion.button>
                                <span className="px-4 py-1 text-sm font-medium">Halaman {logPage}</span>
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => setLogPage((prev) => prev + 1)}
                                    disabled={logPage * logsPerPage >= sortedLogs.length}
                                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}

                    </>
                )}

                {/* Tab Pending (✅ dengan sortir + ikon) */}
                {selectedTab === "pending" && (
                    <div className="overflow-x-auto overflow-y-auto h-[410px]">
                        <table className="w-full border-gray-300 text-sm text-left rounded-lg">
                            <thead className="bg-[#f2f2f2]">
                                <tr>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none group"
                                        onClick={() => handleSort("title")}
                                    >
                                        <span className="inline-flex items-center">
                                            Judul
                                            <SortIcon
                                                active={sortConfig?.key === "title"}
                                                direction={sortConfig?.direction || "asc"}
                                            />
                                        </span>
                                    </th>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none group"
                                        onClick={() => handleSort("category")}
                                    >
                                        <span className="inline-flex items-center">
                                            Kategori
                                            <SortIcon
                                                active={sortConfig?.key === "category"}
                                                direction={sortConfig?.direction || "asc"}
                                            />
                                        </span>
                                    </th>
                                    <th className="px-4 py-2">Deskripsi</th>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none group"
                                        onClick={() => handleSort("amount")}
                                    >
                                        <span className="inline-flex items-center">
                                            Nominal
                                            <SortIcon
                                                active={sortConfig?.key === "amount"}
                                                direction={sortConfig?.direction || "asc"}
                                            />
                                        </span>
                                    </th>
                                    <th className="px-4 py-2">Status</th>
                                    <th
                                        className="px-4 py-2 cursor-pointer select-none group"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        <span className="inline-flex items-center">
                                            Waktu
                                            <SortIcon
                                                active={sortConfig?.key === "createdAt"}
                                                direction={sortConfig?.direction || "asc"}
                                            />
                                        </span>
                                    </th>
                                    <th className="px-4 py-2 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(paginatedData as Transaction[]).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
                                            Tidak ada transaksi yang tersedia.
                                        </td>
                                    </tr>
                                ) : (
                                    (paginatedData as Transaction[]).map((tx) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )} {/* Pagination Tab Pending */}
                {selectedTab === "pending" && (
                    <div className="flex justify-center mt-6 gap-4 items-center">
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
                            disabled={page * itemsPerPage >= sortedData.length}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
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
                                    {`Yakin ingin ${confirmAction.decision === "APPROVED" ? "menyetujui" : "menolak"
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
                                        onClick={() => setConfirmAction({ show: false, id: null, decision: null })}
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
        </AuditorPage>
    );
}
