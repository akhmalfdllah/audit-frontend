"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
  .object({
    currentPassword: z.string().min(6, "Password lama minimal 6 karakter"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi minimal 6 karakter"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Password baru dan konfirmasi tidak sama",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);
    try {
      await axios.patch(
        "/user/me",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { withCredentials: true }
      );
      setSuccess("Password berhasil diperbarui");
      setTimeout(() => router.push("/dashboard"), 1400);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Gagal memperbarui password";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4 text-[#333]">Ganti Password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Password Lama</label>
          <input
            type="password"
            {...register("currentPassword")}
            className="mt-1 w-full border px-3 py-2 rounded-md"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password Baru</label>
          <input
            type="password"
            {...register("newPassword")}
            className="mt-1 w-full border px-3 py-2 rounded-md"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Konfirmasi Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="mt-1 w-full border px-3 py-2 rounded-md"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#f08c00] text-white py-2 rounded-md hover:bg-[#d97706] transition"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 p-3 rounded bg-green-50 text-green-700 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}