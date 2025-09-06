"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Role = "admin" | "auditor" | null;

interface AuthContextType {
    role: Role;
    setRole: (role: Role) => void;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [loading, setLoading] = useState(true);

    // Ambil dari localStorage saat awal render (tanpa /auth/me)
    useEffect(() => {
        try {
            const saved = typeof window !== "undefined" ? localStorage.getItem("app_role") : null;
            if (saved === "Admin" || saved === "admin") setRole("admin");
            else if (saved === "Auditor" || saved === "auditor") setRole("auditor");
            else setRole(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Simpan ke localStorage tiap kali role berubah
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!role) localStorage.removeItem("app_role");
        else localStorage.setItem("app_role", role === "admin" ? "admin" : "auditor");
    }, [role]);

    const logout = () => {
        // opsional: panggil endpoint signout bila ada
        setRole(null);
        if (typeof window !== "undefined") localStorage.removeItem("app_role");
    };

    return (
        <AuthContext.Provider value={{ role, setRole, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
    return ctx;
}
