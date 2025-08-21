import { cookies } from "next/headers"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Audit Transaksi",
  description: "Sistem audit internal dengan ERP",
  icons: {
    icon: "/favicon.ico", // path ke favicon di folder public
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = cookieStore.get("role")?.value

  return (
    <html lang="id">
      <body>
        <div className="flex min-h-screen bg-[#f8f5f0] text-[#635d40]">
          <main className="flex-1 p-0">{children}</main>
        </div>
      </body>
    </html>
  )
}
