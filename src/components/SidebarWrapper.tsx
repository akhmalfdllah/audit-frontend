// src/components/SidebarWrapper.tsx
"use client";

import { ReactNode, useEffect } from "react";
import Sidebar from "./sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/profile-user/ProfileDropdown";
import LoadingScreen from "@/components/loading-screen/LoadingScreen";

interface SidebarWrapperProps {
  children?: ReactNode;
  activeHome: boolean;
}

export default function SidebarWrapper({ children, activeHome }: SidebarWrapperProps) {
  const { role, loading, isAuthAction } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const hideSidebar = pathname === "/login";

  // Guard → kalau sudah logout, lempar ke login (hanya bila bukan di /login dan bukan sedang auth action)
  useEffect(() => {
    if (!loading && !isAuthAction && !role && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, isAuthAction, role, pathname, router]);

  // Loading state → jangan render konten (kecuali di /login)
  if (loading && pathname !== "/login") {
    return <LoadingScreen message="Memeriksa akses..." layout="vertical" />;
  }

  // Kalau belum login dan bukan di /login → jangan render apa-apa
  if (!role && pathname !== "/login") {
    return null;
  }

  // ambil judul halaman dari url
  const pageTitle = (() => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/audit-log")) return "Audit Log";
    if (pathname.startsWith("/departments")) return "Departments";
    if (pathname.startsWith("/transaksi")) return "Transaksi";
    if (pathname.startsWith("/users")) return "Kelola User";
    return "";
  })();

  // Jika sedang di login page → tampilkan children tanpa layout
  if (hideSidebar) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {role && (
        <aside className="sticky top-0 h-screen">
          <div className="h-full flex flex-col justify-between">
            <Sidebar role={role === "admin" ? "Admin" : "Auditor"} activeHome={activeHome} />
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center border-b justify-between px-6 py-2 bg-[#f08c00] rounded-bl-xl shadow-md">
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <ProfileDropdown />
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#f9f6f1]">{children}</main>
      </div>
    </div>
  );
}
