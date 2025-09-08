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
            console.log({ currentPassword, newPassword, confirmPassword });
            await axios.patch(
                "/user/me/password",
                { currentPassword, newPassword, confirmPassword },
                { withCredentials: true }
            );
            setMessage("Password berhasil diubah");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            // opsional: logout user setelah ganti password
            onClose();
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
                className="border rounded px-3 py-2 w-full focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none"
                required
            />

            <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none"
                required
            />

            <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:border-[#f08c00] focus:ring-0.5 focus:ring-[#f08c00] outline-none"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-[#f08c00] text-white px-4 py-2 rounded hover:bg-[#d87a00] transition-transform transform hover:scale-102 w-full"
            >
                {loading ? "Menyimpan..." : "Ganti Password"}
            </button>
        </form>
    );
}
