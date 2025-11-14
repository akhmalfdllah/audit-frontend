"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
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

  // Anti flicker
  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." />;
  }

  useEffect(() => {
    if (!loading && !isAuthAction && !role && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, role, pathname, router, isAuthAction]);

  // Role tidak sesuai
  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="fixed inset-0 z-[9999] backdrop-blur-xl bg-black/40 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center max-w-md border border-white/40"
        >
          <Lock className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk membuka halaman ini.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
