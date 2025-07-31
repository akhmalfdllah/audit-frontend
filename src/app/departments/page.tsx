"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/Layout"

type Group = {
    id: string
    name: string
    description: string
    type: string
}

export default function DepartmentsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [form, setForm] = useState({ name: "", description: "", type: "Internal" })
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
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Manajemen Departemen / Grup</h1>

            <button
                onClick={() => {
                    if (showForm) resetForm()
                    else setShowForm(true)
                }}
                className="bg-[#635d40] text-white px-4 py-2 rounded mb-4"
            >
                {showForm ? "Tutup Form" : "Tambah Group"}
            </button>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-4 mb-6 rounded shadow border border-gray-300"
                >
                    <h2 className="text-lg font-semibold mb-2">
                        {editId ? "Edit Group" : "Tambah Group Baru"}
                    </h2>

                    <div className="mb-2">
                        <label>Nama Group</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            className="w-full border p-2"
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label>Deskripsi</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleFormChange}
                            className="w-full border p-2"
                        />
                    </div>

                    <div className="mb-2">
                        <label>Tipe Group</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleFormChange}
                            className="w-full border p-2"
                        >
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                            <option value="System">System</option>
                        </select>
                    </div>

                    <button type="submit" className="bg-[#f08c00] text-white px-4 py-2 rounded">
                        Simpan
                    </button>
                </form>
            )}

            <table className="w-full border text-sm text-[#635d40]">
                <thead className="bg-[#f08c00] text-white">
                    <tr>
                        <th className="p-2 text-left">Nama</th>
                        <th className="p-2 text-left">Deskripsi</th>
                        <th className="p-2 text-left">Tipe</th>
                        <th className="p-2 text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map(group => (
                        <tr key={group.id} className="border-t">
                            <td className="p-2">{group.name}</td>
                            <td className="p-2">{group.description}</td>
                            <td className="p-2">{group.type}</td>
                            <td className="p-2 space-x-2">
                                <button
                                    onClick={() => startEdit(group)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(group.id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    )
}
