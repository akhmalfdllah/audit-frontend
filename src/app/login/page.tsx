// src/app/login/page.tsx  (atau file LoginPage kamu)
"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validation";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setIsAuthAction } = useAuth(); // <-- gunakan setter
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    setIsAuthAction(true); // <-- mulai aksi auth (blokir redirect/loading)
    try {
      const result = await login(data);
      if (result.ok) {
        if (result.role) {
          const normalized = result.role === "Admin" ? "admin" : "auditor";
          setRole(normalized);
        }
        router.push("/dashboard");
      } else {
        // terima pesan yang dikembalikan login() (backend message diteruskan)
        if (result.error?.includes("tidak aktif")) {
          setErrorMessage("Akun Anda tidak aktif. Silakan hubungi admin.");
        } else if (result.error?.includes("invalid") || result.error?.includes("email")) {
          setErrorMessage("Email atau password salah.");
        } else {
          setErrorMessage(result.error || "Login gagal, coba lagi.");
        }
      }
    } finally {
      // selesaikan aksi auth sehingga guards boleh kembali bekerja
      setIsAuthAction(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8f5f0] to-[#e0dacf]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-96 p-8 bg-white rounded-2xl shadow-lg border border-[#e0dacf]"
      >
        <h2 className="text-2xl font-bold text-[#635d40] text-center mb-2">
          Audit System
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Silakan login untuk melanjutkan
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Email"
              {...register("email")}
              className="border-gray-300 focus:ring-[#f08c00] focus:border-[#f08c00]"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="border-gray-300 focus:ring-[#f08c00] focus:border-[#f08c00]"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#f08c00] hover:bg-[#d87a00] text-white rounded-lg transition-transform transform hover:scale-105"
          >
            {isSubmitting ? "Memproses..." : "Login"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
