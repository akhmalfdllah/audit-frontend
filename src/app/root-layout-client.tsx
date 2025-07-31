// src/app/root-layout-client.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === "/login"

    return (
        <body className="flex min-h-screen bg-[#f8f5f0] text-[#635d40]">
            {!isLoginPage && (
                <aside className="w-64 h-screen bg-[#f08c00] text-white p-4 hidden md:block">
                    <h1 className="text-xl font-bold mb-6">Audit System</h1>
                    <nav className="space-y-2">
                        <Link href="/dashboard" className="block hover:underline">
                            Dashboard
                        </Link>
                        <Link href="/transaksi" className="block hover:underline">
                            Transaksi
                        </Link>
                        <Link href="/audit-log" className="block hover:underline">
                            Log Aktivitas
                        </Link>
                    </nav>
                </aside>
            )}
            <main className="flex-1 p-6">{children}</main>
        </body>
    )
}
