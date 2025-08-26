"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, ListPlus, ClipboardList } from "lucide-react";
import Image from "next/image";

interface SidebarWrapperProps {
    children?: React.ReactNode;
    role: string;
    activeHome: boolean;
}

export default function SidebarWrapper({
    children,
    activeHome,
}: SidebarWrapperProps) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname.startsWith(href);

    return (
            <aside className="w-full md:w-64 bg-[#635d40] text-white min-h-screen flex-col justify-between px-4 py-6">
                <div className="flex items-center mb-6 space-x-2">
                    <Image 
                        src="/favicon.ico" 
                        alt="Filotra Logo" 
                        width={32} 
                        height={32} 
                        />
                    <h1 className="text-xl font-bold">Filotra</h1>
                </div>

                <nav className="space-y-3">
                    <NavItem
                        href="/dashboard"
                        active={isActive("/dashboard") || activeHome}
                        icon={<Home size={18} />}
                    >
                        Dashboard
                    </NavItem>
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
                        icon={<ListPlus size={18} />}
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
                    <NavItem
                        href="/transaksi"
                        active={isActive("/transaksi")}
                        icon={<FileText size={18} />}
                    >
                        Transaksi
                    </NavItem>
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
