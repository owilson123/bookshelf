import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "Your personal reading tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} font-sans antialiased min-h-screen`} style={{ background: "#09090f" }}>
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
        </div>

        <Nav />
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
