"use client";

import { useState } from "react";
import axios from "@/lib/api";

interface Props {
    onClose: () => void;
}

export default function ChangePasswordForm({ onClose }: Props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Password baru dan konfirmasi tidak cocok");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await axios.post(
                "/auth/change-password",
                { currentPassword, newPassword },
                { withCredentials: true }
            );
            setMessage("Password berhasil diubah");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            // opsional: logout user setelah ganti password
            // onClose();
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
            {message && <div className="text-sm text-red-500">{message}</div>}

            <input
                type="password"
                placeholder="Password Lama"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
            />

            <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
            />

            <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-[#635d40] text-white px-4 py-2 rounded hover:bg-[#f08c00]"
            >
                {loading ? "Menyimpan..." : "Ganti Password"}
            </button>
        </form>
    );
}
