import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Users, ListPlus, ClipboardList } from "lucide-react"

export default function Sidebar() {
    const pathname = usePathname()
    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <aside className="w-full md:w-64 bg-[#f08c00] text-white min-h-screen flex flex-col justify-between px-4 py-6">
            <div>
                <h1 className="text-2xl font-bold mb-8">✨ Bukiweb</h1>

                <nav className="space-y-3">
                    <NavItem href="/dashboard" active={isActive("/dashboard")} icon={<Home size={18} />}>
                        Dashboard
                    </NavItem>
                    <NavItem href="/audit-log" active={isActive("/audit-log")} icon={<ClipboardList size={18} />}>
                        Audit Log
                    </NavItem>
                    <NavItem href="/departments" active={isActive("/departments")} icon={<ListPlus size={18} />}>
                        Departments
                    </NavItem>
                    <NavItem href="/users" active={isActive("/users")} icon={<Users size={18} />}>
                        Kelola User
                    </NavItem>
                    <NavItem href="/transaksi" active={isActive("/transaksi")} icon={<FileText size={18} />}>
                        Transaksi
                    </NavItem>
                </nav>
            </div>

            <Link
                href="/register"
                className="mt-6 block bg-purple-600 text-white py-2 rounded-lg text-center text-sm hover:bg-purple-700"
            >
                + Register User
            </Link>
        </aside>
    )
}

function NavItem({
    href,
    icon,
    active,
    children,
}: {
    href: string
    icon: React.ReactNode
    active?: boolean
    children: React.ReactNode
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                active ? "bg-white text-[#333] font-semibold" : "bg-white/20 hover:bg-white/30 text-white"
            }`}
        >
            {icon}
            <span>{children}</span>
        </Link>
    )
}
