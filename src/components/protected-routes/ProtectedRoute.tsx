"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/loading-screen/LoadingScreen";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  allowedRoles: ("admin" | "auditor")[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { role, loading, isAuthAction } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Anti flicker saat reload
  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." />;
  }

  // Redirect jika belum login
  useEffect(() => {
    if (!loading && !isAuthAction && !role && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, isAuthAction, role, pathname, router]);

  // UI akses ditolak
  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm p-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            bg-white/70 backdrop-blur-md border border-gray-200 
            shadow-2xl rounded-2xl p-10 max-w-md text-center
          "
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <ShieldAlert className="w-14 h-14 text-red-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Akses Ditolak
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Anda tidak memiliki izin untuk membuka halaman ini.
            Silakan kembali ke halaman utama atau hubungi administrator.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="
              px-5 py-3 rounded-lg font-medium 
              bg-[#f08c00] text-white 
              hover:bg-[#d87a00] 
              transition-all duration-200 
              shadow-md hover:shadow-lg
            "
          >
            Kembali ke Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}