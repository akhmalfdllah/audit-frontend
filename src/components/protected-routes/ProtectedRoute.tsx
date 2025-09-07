"use client";

import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/loading-screen/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("admin" | "auditor")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unauthorized, setUnauthorized] = useState(false);

  // 🔧 Anti-flicker hanya jika bukan di /login
  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." layout="horizontal" />;
  }

  // Kalau belum login → langsung redirect ke /login
  if (!role) {
    router.replace("/login");
    return null;
  }

  // Kalau login tapi role tidak sesuai
  if (!allowedRoles.includes(role.toLowerCase() as "admin" | "auditor")) {
    if (!unauthorized) {
      setUnauthorized(true);

      // setelah 2 detik balik ke dashboard
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Akses anda terbatas
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk membuka halaman ini.
            <br />
            Mengalihkan ke dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Kalau sudah lolos semua → render halaman
  return <>{children}</>;
}