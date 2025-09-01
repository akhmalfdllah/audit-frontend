"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface Group {
    id: string
    name: string
    description: string
    type: string
}

type User = {
    id: string
    fullName: string
    email: string
    role: string
    status: string
    group: Group
    username: string
}

function handleRequired(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement;
    if (e.type === "invalid") {
        target.setCustomValidity("Form ini wajib diisi");
    } else {
        target.setCustomValidity("");
    }
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [notification, setNotification] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({
        show: false,
        id: null,
    });

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        status: "Active",
        groupId: "",
    })
    const [editId, setEditId] = useState<string | null>(null)
    const [filterText, setFilterText] = useState("")
    const router = useRouter()


    const fetchUsers = useCallback(async (query = "") => {
        try {
            const res = await fetch(`http://localhost:3000/user/all${query}`, {
                credentials: "include",
                cache: "no-store",
            })
            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({}))
                throw new Error(
                    `Gagal akses /users: ${res.status} ${res.statusText} - ${JSON.stringify(errorBody)}`
                )
            }
            const data = await res.json()
            setUsers(data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Terjadi kesalahan tidak diketahui")
            }
            router.push("/login")
        }
    }, [router]) // ✅ tambahkan router sebagai dependency (karena dipakai dalam function)
    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        fetch("http://localhost:3000/all", {
            credentials: "include", // penting untuk kirim cookie token
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(`Gagal fetch group: ${res.status} - ${JSON.stringify(body)}`);
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setGroups(data);
                } else {
                    console.error("Respon group bukan array:", data); // << ini muncul
                    setGroups([]);
                }
            })
            .catch((err) => {
                console.error("Fetch group error:", err.message);
            });
    }, []);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        const query = filterText
            ? `?keyword=${encodeURIComponent(filterText)}&t=${Date.now()}`
            : `?t=${Date.now()}`
        fetchUsers(query)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = editId
            ? Object.fromEntries(
                Object.entries(formData).filter(([key, val]) => {
                    if (val === "") return false;
                    if (key === "confirmPassword" && !formData.password) return false;
                    return true;
                })
            )
            : formData;

        const url = editId ? `http://localhost:3000/user/${editId}` : "http://localhost:3000/user";
        const method = editId ? "PATCH" : "POST";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            if (editId) {
                const updatedUserRes = await fetch(`http://localhost:3000/user/${editId}`, {
                    credentials: "include",
                });
                const updatedUser = await updatedUserRes.json();
                setUsers((prev) => prev.map((u) => (u.id === editId ? updatedUser : u)));
                setNotification("User berhasil diperbarui!");
            } else {
                const created = await res.json();
                setUsers((prev) => [...prev, created]);
                setNotification("User berhasil ditambahkan!");
            }

            setShowForm(false);
            setFormData({
                username: "",
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "",
                status: "Active",
                groupId: "",
            });
            setEditId(null);

            setTimeout(() => setNotification(null), 3000); // popup hilang setelah 3 detik
        } else {
            alert("Gagal menyimpan user");
        }
    }

    function handleDelete(id: string) {
        setConfirmDelete({ show: true, id });
    }
    async function confirmDeleteUser() {
        if (!confirmDelete.id) return;
        const res = await fetch(`http://localhost:3000/user/${confirmDelete.id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
            setNotification("User berhasil dihapus!");
            setTimeout(() => setNotification(null), 3000);
        } else {
            alert("Gagal menghapus user");
        }
        setConfirmDelete({ show: false, id: null });
    }

    function startEdit(user: User) {
        setFormData({
            username: user.username ?? "",
            fullName: user.fullName ?? "",
            email: user.email ?? "",
            password: "",
            confirmPassword: "",
            role: user.role ?? "",
            status: user.status ?? "Active",
            groupId: user.group?.id ?? "",
        })
        setEditId(user.id)
        setShowForm(true)
    }
    //if (loading) return <div>Loading...</div>
    if (error) return <div className="text-red-600">Error: {error}</div>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Kelola User</h1>
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmDelete.show && (
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
                            <h3 className="text-lg font-bold mb-4">Yakin ingin menghapus user ini?</h3>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={confirmDeleteUser}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                                <button
                                    onClick={() => setConfirmDelete({ show: false, id: null })}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSearch} className="mb-4 relative w-64">
                <input
                    type="text"
                    placeholder="Cari user..."
                    className="border p-2 pl-10 w-full focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-500 hover:text-[#f08c00]"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>


            <button
                onClick={() => {
                    if (showForm) {
                        // Kalau sedang terbuka, berarti ingin menutup
                        setShowForm(false)
                        setEditId(null)
                    } else {
                        // Kalau belum terbuka, isi form baru dan buka
                        setFormData({
                            username: "",
                            fullName: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                            role: "",
                            status: "Active",
                            groupId: "",
                        })
                        setShowForm(true)
                        setEditId(null)
                    }
                }}
                className="px-4 py-2 rounded-md font-medium border-b-7 transition-all duration-200 
                transform bg-[#635d40] text-white border-[#f08c00] scale-105 shadow-md mb-4"
                style={{
                    willChange: "transform",
                    textShadow: "0 0 1px rgba(0, 0, 0, 0.1)"
                }}
            >
                {showForm ? "Tutup Form User" : "Tambah User"}
            </button>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="fixed inset-0 backdrop-blur-[2px] flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <button
                                onClick={() => setShowForm(false)}
                                className="absolute top-2 right-5 text-gray-500 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-all duration-150"
                            >
                                ✕
                            </button>

                            <form onSubmit={handleSubmit}>
                                <h2 className="text-xl font-bold mb-4">
                                    {editId ? "Edit User" : "Tambah User"}
                                </h2>

                                {/* --- Field Username --- */}
                                <div className="mb-2">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required
                                        onInvalid={handleRequired}
                                        onInput={handleRequired}
                                    />
                                </div>

                                {/* --- Field Nama Lengkap --- */}
                                <div className="mb-2">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fullName: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required
                                        onInvalid={handleRequired}
                                        onInput={handleRequired}
                                    />
                                </div>

                                {/* --- Field Email --- */}
                                <div className="mb-2">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required
                                    />
                                </div>

                                {/* --- Password dan Konfirmasi Password --- */}
                                <div className="mb-2">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required={!editId}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label>Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required={!editId}
                                    />
                                </div>

                                {/* --- Role --- */}
                                <div className="mb-2">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required
                                    >
                                        <option value="">Pilih Role</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Auditor">Auditor</option>
                                        <option value="ERP">ERP</option>
                                    </select>
                                </div>

                                {/* --- Group --- */}
                                <div className="mb-2">
                                    <label>Group</label>
                                    <select
                                        value={formData.groupId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, groupId: e.target.value })
                                        }
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm" required
                                    >
                                        <option value="">Pilih Group</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-[#f08c00] hover:bg-[#d87a00] text-white px-4 py-2 rounded transition-transform transform hover:scale-102 w-full"
                                >
                                    {editId ? "Update" : "Simpan"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <table className="w-full border-gray-300 text-sm text-left rounded-lg">
                <thead className="bg-[#f2f2f2]">
                    <tr>
                        <th className="px-4 py-2">Nama</th>
                        <th className="px-4 py-2">Username</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Group</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{user.fullName}</td>
                            <td className="px-4 py-2 capitalize">{user.username}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2 capitalize">{user.role}</td>
                            <td className="px-4 py-2">{user.status}</td>
                            <td className="px-4 py-2">{user.group?.name}</td>
                            <td className="px-4 py-2">{user.group?.type}</td>
                            <td className="px-4 py-2">{user.group?.description}</td>
                            <td className="px-4 py-2 space-x-2 text-center">
                                <button
                                    onClick={() => startEdit(user)}
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
