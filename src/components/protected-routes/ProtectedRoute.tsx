// ===========================
// ProtectedRoute.tsx (Final)
// ===========================
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


  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." />;
  }


  useEffect(() => {
    if (!loading && !isAuthAction && !role && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, isAuthAction, role, pathname, router]);


  if (role && !allowedRoles.includes(role)) {
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
            Akses terbatas
          </h2>
          <p className="text-gray-600">Anda tidak memiliki izin membuka halaman ini.</p>
        </motion.div>
      </div>
    );
  }


  return <>{children}</>;
}