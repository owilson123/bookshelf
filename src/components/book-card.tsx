"use client";

import { Book } from "@/lib/types";
import { Star, BookOpen, Clock, CheckCheck, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SHELF_LABELS = {
  currently_reading: "Currently Reading",
  want_to_read: "Want to Read",
  read: "Read",
};

function StarRating({ rating, onChange }: { rating: number | null; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)}>
          <Star
            className={`w-3 h-3 transition-all ${
              (rating ?? 0) >= n
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                : "text-white/15 hover:text-amber-400/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const pct = book.page_count && book.current_page
    ? Math.min(100, Math.round((book.current_page / book.page_count) * 100))
    : 0;

  async function moveToShelf(shelf: Book["shelf"]) {
    const updates: Record<string, unknown> = { shelf };
    if (shelf === "read" && !book.date_read) {
      updates.date_read = new Date().toISOString().split("T")[0];
    }
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) { toast.success(`Moved to "${SHELF_LABELS[shelf]}"`); router.refresh(); }
  }

  async function setRating(rating: number) {
    await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    router.refresh();
  }

  async function deleteBook() {
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Book removed"); router.refresh(); }
  }

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(245,158,11,0.25)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      }}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <BookOpen className="w-8 h-8 text-white/10" />
            <p className="text-[10px] text-white/20 text-center line-clamp-3 leading-tight">{book.title}</p>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(9,9,15,0.8) 0%, transparent 50%)" }} />

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-colors"
              style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
              style={{ background: "rgba(18,18,28,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
              className="text-white/80 min-w-[160px]">
              {(["currently_reading", "want_to_read", "read"] as const)
                .filter((s) => s !== book.shelf)
                .map((s) => (
                  <DropdownMenuItem key={s} onClick={() => moveToShelf(s)}
                    className="hover:bg-white/5 hover:text-white cursor-pointer text-xs">
                    Move to {SHELF_LABELS[s]}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
              <DropdownMenuItem onClick={deleteBook}
                className="text-red-400/80 hover:bg-red-400/10 hover:text-red-400 cursor-pointer text-xs">
                Remove from shelf
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-[13px] leading-snug line-clamp-2 text-white/90">{book.title}</h3>
          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{book.author}</p>
        </div>

        {book.shelf === "currently_reading" && book.page_count ? (
          <div className="space-y-1.5">
            <Progress value={pct} className="h-0.5 bg-white/8 [&>div]:bg-amber-400" />
            <p className="text-[10px] text-white/30">{pct}% · p.{book.current_page}/{book.page_count}</p>
          </div>
        ) : book.shelf === "read" ? (
          <StarRating rating={book.rating} onChange={setRating} />
        ) : (
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-white/20" />
            <span className="text-[10px] text-white/25">Want to read</span>
          </div>
        )}
      </div>
    </div>
  );
}
