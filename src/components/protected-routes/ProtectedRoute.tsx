"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/loading-screen/LoadingScreen";

interface Props {
  children: ReactNode;
  allowedRoles: ("admin" | "auditor")[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { role, loading, isAuthAction } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Anti-flicker
  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." />;
  }

  // Jika tidak ada role → redirect login
  useEffect(() => {
    if (!loading && !isAuthAction && !role && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, role, pathname, router, isAuthAction]);

  // Role tidak cocok
  if (role && !allowedRoles.includes(role)) {
    return <div className="p-10 text-center">Akses ditolak</div>;
  }

  return <>{children}</>;
}
