import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SidebarWrapper from "@/components/SidebarWrapper";

export const metadata = {
  title: "Filotra",
  // cegah cache halaman private agar setelah logout tidak muncul dari cache
  other: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen flex">
        <AuthProvider>
          {/* SidebarWrapper sekarang ambil role dari context (tanpa prop role) */}
          <SidebarWrapper activeHome={false}>
            {children}
          </SidebarWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
