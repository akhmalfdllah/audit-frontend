"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchMe } from "@/lib/auth";

type Role = "admin" | "auditor" | null;

interface AuthContextType {
  role: Role;
  setRole: (r: Role) => void;
  loading: boolean;
  logout: () => void;

  isAuthAction: boolean;
  setIsAuthAction: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthAction, setIsAuthAction] = useState(false);

  // Restore session dari token di cookie
  useEffect(() => {
    const restore = async () => {
      const me = await fetchMe();
      if (me.ok) {
        const normalized =
          me.user.role === "Admin" ? "admin" : "auditor";
        setRole(normalized);
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    restore();
  }, []);

  const logout = () => {
    setRole(null);
  };

  // Dari axios interceptor
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
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
