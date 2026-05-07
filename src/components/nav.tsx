"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, Upload, Search, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Shelves", icon: BookMarked },
  { href: "/search", label: "Search", icon: Search },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/import", label: "Import", icon: Upload },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(20px) saturate(180%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <BookOpen className="w-4 h-4 text-[#09090f]" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">Bookshelf</span>
          </Link>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                  pathname === href
                    ? "text-amber-400 shadow-sm"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
                )}
                style={pathname === href ? { background: "rgba(245,158,11,0.12)" } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
}
