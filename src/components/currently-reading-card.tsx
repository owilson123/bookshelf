"use client";

import { Book } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, parseISO } from "date-fns";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CurrentlyReadingCard({ book }: { book: Book }) {
  const router = useRouter();
  const [page, setPage] = useState(book.current_page ?? 0);
  const [editing, setEditing] = useState(false);

  const pct = book.page_count ? Math.min(100, Math.round((page / book.page_count) * 100)) : 0;
  const daysElapsed = book.date_added ? differenceInDays(new Date(), parseISO(book.date_added)) : 0;

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
    <div className="relative overflow-hidden rounded-2xl bg-[#161b22] border border-amber-400/20 shadow-2xl shadow-amber-400/5">
      {/* Blurred background cover */}
      {book.cover_url && (
        <div className="absolute inset-0 opacity-10">
          <Image src={book.cover_url} alt="" fill className="object-cover blur-2xl scale-110" sizes="100vw" />
        </div>
      )}

      <div className="relative flex gap-5 p-5 sm:p-6">
        {/* Cover */}
        <div className="relative w-24 sm:w-32 flex-shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl shadow-black/50">
            {book.cover_url ? (
              <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="w-full h-full bg-[#0d1117] flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white/20" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">Currently Reading</p>
            <h2 className="font-bold text-lg sm:text-xl leading-tight text-[#e6e1d3] line-clamp-2">{book.title}</h2>
            <p className="text-sm text-[#8b8685] mt-1">{book.author}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8b8685]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysElapsed === 0 ? "Started today" : `${daysElapsed} day${daysElapsed !== 1 ? "s" : ""} in`}
              </span>
              {book.page_count && (
                <button
                  onClick={() => setEditing(true)}
                  className="hover:text-amber-400 transition-colors"
                >
                  {editing ? null : `${page} / ${book.page_count} pages`}
                </button>
              )}
            </div>

            <Progress value={pct} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-amber-300 [&>div]:transition-all [&>div]:duration-500" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-semibold">{pct}% complete</span>

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
                    className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-[#e6e1d3] outline-none focus:border-amber-400/50"
                    onBlur={() => setEditing(false)}
                  />
                  <button type="submit" className="text-xs text-amber-400 hover:underline">Save</button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
