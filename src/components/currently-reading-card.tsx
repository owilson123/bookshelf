"use client";

import { Book } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";
import Image from "next/image";
import { BookOpen, Clock, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CurrentlyReadingCard({ book }: { book: Book }) {
  const router = useRouter();
  const [page, setPage] = useState(book.current_page ?? 0);
  const [editing, setEditing] = useState(false);

  const pct = book.page_count ? Math.min(100, Math.round((page / book.page_count) * 100)) : 0;
  const daysElapsed = book.date_added ? differenceInDays(new Date(), parseISO(book.date_added)) : 0;
  const pagesLeft = book.page_count ? book.page_count - page : null;

  async function savePage(newPage: number) {
    setPage(newPage);
    setEditing(false);
    await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_page: newPage }),
    });
    router.refresh();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(245,158,11,0.2)",
        boxShadow: "0 0 0 1px rgba(245,158,11,0.05), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>

      {/* Blurred cover background */}
      {book.cover_url && (
        <div className="absolute inset-0 overflow-hidden">
          <Image src={book.cover_url} alt="" fill className="object-cover scale-110" sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "rgba(9,9,15,0.88)" }} />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(40px) saturate(60%)" }} />
        </div>
      )}

      <div className="relative flex gap-5 p-5">
        {/* Book cover */}
        <div className="flex-shrink-0">
          <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)" }}>
            {book.cover_url ? (
              <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <BookOpen className="w-6 h-6 text-white/20" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 py-0.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400/80 mb-1.5">Now Reading</p>
            <h2 className="font-bold text-base sm:text-lg leading-tight text-white line-clamp-2">{book.title}</h2>
            <p className="text-sm text-white/50 mt-1">{book.author}</p>
          </div>

          <div className="space-y-2.5">
            {/* Progress bar */}
            <div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #d97706, #f59e0b, #fcd34d)",
                    boxShadow: "0 0 8px rgba(245,158,11,0.5)",
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-white/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysElapsed === 0 ? "Started today" : `${daysElapsed}d in`}
                </span>
                {pagesLeft !== null && (
                  <span>{pagesLeft} pages left</span>
                )}
              </div>

              {editing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseInt((e.currentTarget.elements.namedItem("p") as HTMLInputElement).value);
                    if (!isNaN(val) && val >= 0) savePage(val);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    name="p"
                    type="number"
                    defaultValue={page}
                    min={0}
                    max={book.page_count ?? undefined}
                    autoFocus
                    onBlur={() => setEditing(false)}
                    className="w-16 text-[11px] text-center rounded-lg px-2 py-1 outline-none text-amber-400"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                  />
                  <button type="submit" className="text-[11px] text-amber-400 hover:text-amber-300">Save</button>
                </form>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-amber-400 transition-colors group/edit"
                >
                  <span className="font-semibold tabular-nums">{pct}%</span>
                  {book.page_count && (
                    <span className="text-white/25">· p.{page}/{book.page_count}</span>
                  )}
                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
