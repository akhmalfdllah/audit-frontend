// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Role = "admin" | "auditor" | null;

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  loading: boolean; // masih digunakan untuk anti-flicker inisialisasi
  logout: () => void;
  // NEW:
  isAuthAction: boolean; // true saat login/submit sedang berlangsung
  setIsAuthAction: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  // NEW: flag untuk menandai aksi auth (login/submit)
  const [isAuthAction, setIsAuthAction] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!role) localStorage.removeItem("app_role");
    else localStorage.setItem("app_role", role === "admin" ? "admin" : "auditor");
  }, [role]);

  const logout = () => {
    setRole(null);
    if (typeof window !== "undefined") localStorage.removeItem("app_role");
  };

    // 🔴 Dengarkan event dari axios interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("force-logout", handler);
    return () => window.removeEventListener("force-logout", handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        loading,
        logout,
        isAuthAction,
        setIsAuthAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
