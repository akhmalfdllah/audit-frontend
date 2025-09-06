"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, KeyRound, CircleUserRound } from "lucide-react";
import axios from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfileDropdown() {
  const { role, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Tutup saat klik di luar atau Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Kalau bukan admin/auditor → jangan render apapun
  if (!role || !["admin", "auditor"].includes(role.toLowerCase())) {
    return null;
  }

  const handleLogout = async () => {
  try {
    await axios.post("/auth/signout", {}, { withCredentials: true });
  } catch (err) {
    console.warn("Signout request failed:", err);
  } finally {
    logout(); // clear context
    // ganti history supaya back tidak mengembalikan halaman private
    window.history.replaceState(null, "", "/login");
    router.replace("/login");
  }
};

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
        title={role}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
  <CircleUserRound className="w-6 h-6" />
</div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-medium text-white leading-none">
            {role.toUpperCase()}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </motion.button>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
  <CircleUserRound className="w-8 h-8" />
</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {role.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="p-2">
              <button
                onClick={() => setOpen(false) /* bisa juga buka modal ganti password */}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700"
                role="menuitem"
              >
                <KeyRound className="w-4 h-4 text-gray-700" />
                <span>Ganti Password</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-red-600"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
