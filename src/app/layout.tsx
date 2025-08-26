"use client";

import { usePathname } from "next/navigation";
import SidebarWrapper from "@/components/SidebarWrapper";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";

  return (
    <html lang="en">
      <body className="h-screen flex">
        {!hideSidebar && (
          <SidebarWrapper role="admin" activeHome={false}>
            {/* Bisa tambahkan children untuk isi sidebar */}
          </SidebarWrapper>
        )}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
