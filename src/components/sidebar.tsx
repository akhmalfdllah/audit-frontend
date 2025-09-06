"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, ClipboardList, Building2 } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
    role?: string; // "Admin" | "Auditor"
    activeHome?: boolean;
}

export default function Sidebar({ role, activeHome }: SidebarProps) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname.startsWith(href);

    // Normalisasi agar aman dibandingkan dengan string
    const isAdmin = role === "Admin" || role === "admin";
    const isAuditor = role === "Auditor" || role === "auditor";

    return (
        <aside className="sticky top-0 h-screen bg-[#635d40] text-white w-full md:w-64 px-4 py-6 flex flex-col justify-between shadow">
            <div className="flex items-center mb-6 space-x-2">
                <Image src="/favicon.ico" alt="Filotra Logo" width={32} height={32} />
                <h1 className="text-2xl font-bold">Filotra</h1>
            </div>

            <nav className="flex-1 space-y-3">
                {/* Semua role */}
                <NavItem
                    href="/dashboard"
                    active={isActive("/dashboard") || activeHome}
                    icon={<Home size={18} />}
                >
                    Dashboard
                </NavItem>

                {/* Hanya Admin */}
                {isAdmin && (
                    <>
                        <NavItem
                            href="/audit-log"
                            active={isActive("/audit-log")}
                            icon={<ClipboardList size={18} />}
                        >
                            Audit Log
                        </NavItem>
                        <NavItem
                            href="/departments"
                            active={isActive("/departments")}
                            icon={<Building2 size={18} />}
                        >
                            Departments
                        </NavItem>
                        <NavItem
                            href="/users"
                            active={isActive("/users")}
                            icon={<Users size={18} />}
                        >
                            Kelola User
                        </NavItem>
                    </>
                )}

                {/* Auditor: hanya Transaksi */}
                {isAuditor && (
                    <NavItem
                        href="/transaksi"
                        active={isActive("/transaksi")}
                        icon={<FileText size={18} />}
                    >
                        Transaksi
                    </NavItem>
                )}

                {/* Jika ingin admin juga punya Transaksi, hapus komentar di bawah */}
                {/* {isAdmin && (
          <NavItem
            href="/transaksi"
            active={isActive("/transaksi")}
            icon={<FileText size={18} />}
          >
            Transaksi
          </NavItem>
        )} */}
            </nav>
        </aside>
    );
}

function NavItem({
    href,
    icon,
    active,
    children,
}: {
    href: string;
    icon: React.ReactNode;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active
                    ? "bg-white text-[#333] font-semibold"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
