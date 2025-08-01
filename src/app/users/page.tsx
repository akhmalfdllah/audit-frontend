"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"

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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
    const [error, setError] = useState("")
    //const [loading, setLoading] = useState(true)
    const [groupForm, setGroupForm] = useState({
        name: "",
        description: "",
        type: "Internal",
    })
    const [showGroupForm, setShowGroupForm] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Auditor",
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
        } catch (err: any) {
            setError(err.message)
            console.error(err)
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
        e.preventDefault()
        const payload = editId
            ? Object.fromEntries(
                Object.entries(formData).filter(([key, val]) => {
                    if (val === "") return false
                    if (key === "confirmPassword" && !formData.password) return false
                    return true
                })
            )
            : formData
        console.log("Payload dikirim:", JSON.stringify(payload, null, 2))
        const url = editId ? `http://localhost:3000/user/${editId}` : "http://localhost:3000/user"
        const method = editId ? "PATCH" : "POST"
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),

        })
        if (res.ok) {
            if (editId) {
                // 🔁 Fetch ulang user lengkap setelah update
                const updatedUserRes = await fetch(`http://localhost:3000/user/${editId}`, {
                    credentials: "include",
                })
                const updatedUser = await updatedUserRes.json()
                setUsers((prev) => prev.map((u) => (u.id === editId ? updatedUser : u)))
            } else {
                const created = await res.json()
                setUsers((prev) => [...prev, created])
            }
            setShowForm(false)
            setFormData({
                username: "",
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "Auditor",
                status: "Active",
                groupId: "",
            })
            setEditId(null)

            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({}))
                console.error("Gagal tambah/update:", res.status, errorBody)
                alert("Gagal menyimpan user")
            }
        } else {
            alert("Gagal menyimpan user")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Yakin ingin menghapus user ini?")) return
        const res = await fetch(`http://localhost:3000/user/${id}`, {
            method: "DELETE",
            credentials: "include",
        })
        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== id))
        } else {
            alert("Gagal menghapus user")
        }
    }

    function startEdit(user: User) {
        setFormData({
            username: user.username ?? "",
            fullName: user.fullName ?? "",
            email: user.email ?? "",
            password: "",
            confirmPassword: "",
            role: user.role ?? "Auditor",
            status: user.status ?? "Active",
            groupId: user.group?.id ?? "",
        })
        setEditId(user.id)
        setShowForm(true)
    }
    async function handleAddGroup(e: React.FormEvent) {
        e.preventDefault()
        const res = await fetch("http://localhost:3000/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(groupForm),
        })
        if (res.ok) {
            alert("Group berhasil ditambahkan")
            setShowGroupForm(false)
            setGroupForm({ name: "", description: "", type: "Internal" })
            // Refresh daftar group
            fetch("http://localhost:3000/all", { credentials: "include" })
                .then(res => res.json())
                .then(data => setGroups(data))
        } else {
            const err = await res.json().catch(() => ({}))
            alert("Gagal menambahkan group: " + (err.message || res.status))
        }
    }
    //if (loading) return <div>Loading...</div>
    if (error) return <div className="text-red-600">Error: {error}</div>

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Kelola User</h1>

            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    placeholder="Cari nama / email / group"
                    className="border p-2 mr-2"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                <button type="submit" className="bg-[#f08c00] text-white px-4 py-2 rounded">
                    Cari
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
                            role: "Auditor",
                            status: "Active",
                            groupId: "",
                        })
                        setShowForm(true)
                        setEditId(null)
                    }
                }}
                className="bg-[#635d40] text-white px-4 py-2 rounded ml-2"
            >
                {showForm ? "Tutup Form User" : "Tambah User"}
            </button>

            <button
                onClick={() => setShowGroupForm(!showGroupForm)}
                className="bg-[#635d40] text-white px-4 py-2 rounded ml-2"
            >
                {showGroupForm ? "Tutup Form Grup" : "Tambah Group"}
            </button>
            {showGroupForm && (
                <form
                    onSubmit={handleAddGroup}
                    className="bg-white p-4 mt-4 rounded shadow border border-gray-300"
                >
                    <h2 className="text-lg font-semibold mb-2">Form Tambah Group</h2>
                    <div className="mb-2">
                        <label>Nama Group</label>
                        <input
                            type="text"
                            value={groupForm.name}
                            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                            className="w-full border p-2"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label>Deskripsi</label>
                        <textarea
                            value={groupForm.description}
                            onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                            className="w-full border p-2"
                        />
                    </div>
                    <div className="mb-2">
                        <label>Tipe Group</label>
                        <select
                            value={groupForm.type}
                            onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}
                            className="w-full border p-2"
                        >
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                            <option value="System">System</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-[#635d40] text-white px-4 py-2 rounded">
                        Simpan Group
                    </button>
                </form>
            )}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
                    <div className="mb-2">
                        <label>Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full border p-2"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label>Nama Lengkap</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full border p-2"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border p-2"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border p-2"
                            required={!editId}
                        />
                    </div>
                    <div className="mb-2">
                        <label>Konfirmasi Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full border p-2"
                            required={!editId}
                        />
                    </div>
                    <div className="mb-2">
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full border p-2"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Auditor">Auditor</option>
                            <option value="ERP">ERP</option>
                        </select>
                    </div>
                    <div className="mb-2">
                        <label>Group</label>
                        <select
                            value={formData.groupId}
                            onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                            className="w-full border p-2"
                            required
                        >
                            <option value="">Pilih Grup</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="bg-[#f08c00] text-white px-4 py-2 rounded">
                        {editId ? "Update" : "Simpan"}
                    </button>
                </form>
            )}

            <table className="w-full border text-sm text-[#635d40]">
                <thead className="bg-[#f08c00] text-white">
                    <tr>
                        <th className="p-2 text-left">Nama</th>
                        <th className="p-2 text-left">Username</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Group</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t">
                            <td className="p-2">{user.fullName}</td>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2 capitalize">{user.role}</td>
                            <td className="p-2">{user.status}</td>
                            <td className="p-2">{user.group?.name}</td>
                            <td className="p-2">{user.group?.type}</td>
                            <td className="p-2">{user.group?.description}</td>
                            <td className="p-2 space-x-2">
                                <button
                                    onClick={() => startEdit(user)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
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
