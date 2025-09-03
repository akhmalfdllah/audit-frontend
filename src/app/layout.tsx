"use client";

import { usePathname } from "next/navigation";
import SidebarWrapper from "@/components/SidebarWrapper";
import "./globals.css";
import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: "Admin" | "Auditor";
  exp: number;
  iat: number;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";

  const [role, setRole] = useState<DecodedToken["role"] | null>(null);

  useEffect(() => {
  fetch("http://localhost:3000/auth/me", {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => {
      console.log("DATA USER:", data);
      setRole(data.role);
    })
    .catch(err => {
      console.error("Gagal ambil user:", err);
      setRole(null);
    });
}, []);


  return (
    <html lang="en">
      <body className="h-screen flex">
        {!hideSidebar && (
          role ? (
            <SidebarWrapper role={role} activeHome={false} />
          ) : (
            <div className="w-64 bg-[#635d40] text-white flex items-center justify-center">
              Loading...
            </div>
          )
        )}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
