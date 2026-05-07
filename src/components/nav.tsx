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
    <nav className="border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-amber-400 font-semibold text-lg">
            <BookOpen className="w-5 h-5" />
            Bookshelf
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-amber-400/10 text-amber-400"
                    : "text-[#8b8685] hover:text-[#e6e1d3] hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
