"use client"

import React from "react"
import Sidebar from "./sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar kiri */}
            <Sidebar />

            {/* Area kanan: header + konten */}
            <div className="flex flex-col flex-1 bg-gray-50">
                {/* Header */}
                <header className="bg-[#f08c00] text-white px-6 py-3 shadow-md">
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-semibold hidden md:block">Audit Transaksi Keuangan</h1>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-grow px-6 py-4">{children}</main>

                {/* Footer */}
                <footer className="#635d40 text-center">
                    &copy; {new Date().getFullYear()} Filotra
                </footer>
            </div>
        </div>
    )
}
