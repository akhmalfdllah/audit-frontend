// src/app/page.tsx
"use client"

import Link from "next/link"

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-[#635d40]">Selamat Datang di Audit System</h1>
      <p className="mt-4">
        <Link href="/dashboard" className="text-[#f08c00] underline hover:text-[#d87a00]">
          Masuk ke Dashboard
        </Link>
      </p>
    </main>
  )
}
