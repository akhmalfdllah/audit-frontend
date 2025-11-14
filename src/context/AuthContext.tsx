// ===========================
// AuthContext.tsx (Final)
// ===========================
"use client";


import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "@/lib/api";


type Role = "admin" | "auditor" | null;


interface AuthContextType {
role: Role;
setRole: (role: Role) => void;
loading: boolean; // true saat inisialisasi cek auth ke backend
logout: () => void;
isAuthAction: boolean; // true saat login sedang berlangsung
setIsAuthAction: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
const [role, setRole] = useState<Role>(null);
const [loading, setLoading] = useState(true);
const [isAuthAction, setIsAuthAction] = useState(false);


// ===========================
// 1. Cek login status ke backend (/auth/me)
// ===========================
useEffect(() => {
async function checkAuth() {
try {
const res = await axios.get("/auth/me", { withCredentials: true });
const r = res?.data?.role;
if (r === "Admin" || r === "admin") setRole("admin");
else if (r === "Auditor" || r === "auditor") setRole("auditor");
else setRole(null);
} catch {
setRole(null);
} finally {
setLoading(false);
}
}


checkAuth();
}, []);


// ===========================
// 2. Logout handler
// ===========================
const logout = async () => {
try {
await axios.post("/auth/signout", {}, { withCredentials: true });
} catch {}
setRole(null);
};


// ===========================
// 3. Event listener utk force logout dari interceptor
// ===========================
useEffect(() => {
const handler = () => logout();
window.addEventListener("force-logout", handler);
return () => window.removeEventListener("force-logout", handler);
}, []);


return (
<AuthContext.Provider
value={{ role, setRole, loading, logout, isAuthAction, setIsAuthAction }}
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