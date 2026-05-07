export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import { Book } from "@/lib/types";
import { BookCard } from "@/components/book-card";
import { CurrentlyReadingCard } from "@/components/currently-reading-card";
import { BookOpen, Clock, CheckCheck, BookMarked, Search, Upload } from "lucide-react";
import Link from "next/link";
import { RefreshCoversButton } from "@/components/refresh-covers-button";

async function getBooks(): Promise<Book[]> {
  try {
    const rows = await sql`SELECT * FROM books ORDER BY date_added DESC`;
    return rows as unknown as Book[];
  } catch {
    return [];
  }
}

export default async function ShelvesPage() {
  const books = await getBooks();
  const currentlyReading = books.filter((b) => b.shelf === "currently_reading");
  const wantToRead = books.filter((b) => b.shelf === "want_to_read");
  const read = books.filter((b) => b.shelf === "read");
  const missingCovers = books.filter((b) => !b.cover_url).length;

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.12)" }}>
          <BookMarked className="w-9 h-9 text-amber-400/40" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Your shelf is empty</h2>
        <p className="text-white/40 mb-8 max-w-sm text-[15px] leading-relaxed">
          Search for books to add them to your shelves, or import your entire Goodreads library in one go.
        </p>
        <div className="flex gap-3">
          <Link href="/search"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-amber-400 transition-all duration-200 hover:scale-105"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Search className="w-4 h-4" /> Search Books
          </Link>
          <Link href="/import"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white/60 transition-all duration-200 hover:text-white/80 hover:scale-105"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Upload className="w-4 h-4" /> Import CSV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">My Bookshelf</h1>
          <p className="text-white/40 mt-2 text-[15px]">
            {books.length} book{books.length !== 1 ? "s" : ""} across your shelves
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-5 text-[13px]">
            <Stat icon={<BookOpen className="w-3.5 h-3.5 text-amber-400" />} count={currentlyReading.length} label="reading" />
            <Stat icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-400" />} count={read.length} label="read" />
            <Stat icon={<Clock className="w-3.5 h-3.5 text-blue-400" />} count={wantToRead.length} label="to read" />
          </div>
          <RefreshCoversButton missingCount={missingCovers} />
        </div>
      </div>

      {/* Currently Reading */}
      {currentlyReading.length > 0 && (
        <ShelfSection
          icon={<BookOpen className="w-3.5 h-3.5 text-amber-400" />}
          label="Currently Reading"
          count={currentlyReading.length}
          accent="amber"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentlyReading.map((book) => (
              <CurrentlyReadingCard key={book.id} book={book} />
            ))}
          </div>
        </ShelfSection>
      )}

      {/* Want to Read */}
      {wantToRead.length > 0 && (
        <ShelfSection
          icon={<Clock className="w-3.5 h-3.5 text-blue-400" />}
          label="Want to Read"
          count={wantToRead.length}
          accent="blue"
        >
          <BookGrid books={wantToRead} />
        </ShelfSection>
      )}

      {/* Read */}
      {read.length > 0 && (
        <ShelfSection
          icon={<CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
          label="Read"
          count={read.length}
          accent="emerald"
        >
          <BookGrid books={read} />
        </ShelfSection>
      )}
    </div>
  );
}

function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

function ShelfSection({
  icon, label, count, accent, children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  accent: "amber" | "blue" | "emerald";
  children: React.ReactNode;
}) {
  const dividerColor = {
    amber: "rgba(245,158,11,0.15)",
    blue: "rgba(96,165,250,0.15)",
    emerald: "rgba(52,211,153,0.15)",
  }[accent];

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/50">{label}</h2>
          <span className="text-[12px] text-white/25 font-medium">{count}</span>
        </div>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${dividerColor}, transparent)` }} />
      </div>
      {children}
    </section>
  );
}

function Stat({ icon, count, label }: { icon: React.ReactNode; count: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/40">
      {icon}
      <span className="font-semibold text-white/70">{count}</span>
      <span>{label}</span>
    </div>
  );
}
