"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion";

type Group = {
    id: string
    name: string
    description: string
    type: string
}

export default function DepartmentsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [form, setForm] = useState({ name: "", description: "", type: "" })
    const [editId, setEditId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetch("http://localhost:3000/all", {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setGroups(data)
                } else {
                    console.error("Data group bukan array:", data)
                }
            })
    }, [])

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const url = editId
            ? `http://localhost:3000/${editId}`
            : `http://localhost:3000/groups`
        const method = editId ? "PATCH" : "POST"

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(form),
        })

        if (res.ok) {
            const updated = await res.json()
            if (editId) {
                setGroups(prev => prev.map(g => (g.id === editId ? updated : g)))
            } else {
                setGroups(prev => [...prev, updated])
            }
            resetForm()
        } else {
            const err = await res.json().catch(() => ({}))
            alert("Gagal menyimpan group: " + (err.message || res.status))
        }
    }

    function startEdit(group: Group) {
        setForm({
            name: group.name,
            description: group.description,
            type: group.type,
        })
        setEditId(group.id)
        setShowForm(true)
    }

    async function handleDelete(id: string) {
        if (!confirm("Yakin ingin menghapus group ini?")) return
        const res = await fetch(`http://localhost:3000/${id}`, {
            method: "DELETE",
            credentials: "include",
        })
        if (res.ok) {
            setGroups(prev => prev.filter(g => g.id !== id))
        } else {
            alert("Gagal menghapus group")
        }
    }

    function resetForm() {
        setForm({ name: "", description: "", type: "Internal" })
        setEditId(null)
        setShowForm(false)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manajemen Departemen / Grup</h1>

            <button
                onClick={() => {
                    if (showForm) resetForm();
                    else setShowForm(true);
                }}
                className="px-4 py-2 rounded-md font-medium border-b-7 transition-all duration-200 
                transform bg-[#635d40] text-white border-[#f08c00] scale-105 shadow-md mb-4"
                style={{
                    willChange: "transform",
                    textShadow: "0 0 1px rgba(0, 0, 0, 0.1)"
                }}
            >
                {showForm ? "Tutup Form Group" : "Tambah Group"}
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
                                    {editId ? "Edit Group" : "Tambah Group Baru"}
                                </h2>

                                {/* --- Field Nama Group --- */}
                                <div className="mb-2">
                                    <label>Nama Group</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                        required
                                    />
                                </div>

                                {/* --- Deskripsi --- */}
                                <div className="mb-2">
                                    <label>Deskripsi</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                    />
                                </div>

                                {/* --- Tipe Group --- */}
                                <div className="mb-2">
                                    <label>Tipe Group</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none rounded-sm"
                                    >
                                        <option value="" disabled>Pilih Tipe</option>
                                        <option value="Internal">Internal</option>
                                        <option value="External">External</option>
                                        <option value="System">System</option>
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
                        <th className="px-4 py-2">Wilayah</th>
                        <th className="px-4 py-2">Tipe</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map(group => (
                        <tr key={group.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{group.name}</td>
                            <td className="px-4 py-2">{group.description}</td>
                            <td className="px-4 py-2">{group.type}</td>
                            <td className="px-4 py-2 space-x-2 text-center">
                                <button
                                    onClick={() => startEdit(group)}
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(group.id)}
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
