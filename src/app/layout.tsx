// app/layout.tsx
import { cookies } from "next/headers"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Audit Transaksi",
  description: "Sistem audit internal dengan ERP",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname
  const cookieStore = await cookies()
  const role = cookieStore.get("role")?.value

  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login"
  // 🧠 Tapi kode ini tidak akan jalan di server-side, jadi...

  return (
    <html lang="id">
      <body>
        {/** Solusi terbaik di bawah */}
        {typeof window === "undefined" ? (
          // Server-side fallback: tampilkan children langsung
          children
        ) : window.location.pathname === "/login" ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen bg-[#f8f5f0] text-[#635d40]">
            {/* Sidebar */}
            <aside className="w-64 h-screen bg-[#f08c00] text-white p-4 hidden md:block">
              <h1 className="text-xl font-bold mb-6">Audit System</h1>
              <nav className="space-y-2">
                <a href="/dashboard">Dashboard</a>
                <a href="/transaksi">Transaksi</a>
                <a href="/audit-log">Log Aktivitas</a>
                {role === "Admin" && <a href="/users">Kelola User</a>}
              </nav>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        )}
      </body>
    </html>
  )
}
