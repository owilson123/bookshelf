"use client";

import { GoogleBooksVolume, Book } from "@/lib/types";
import { BookOpen, Plus, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { volumeToBook } from "@/lib/google-books-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SHELF_LABELS = {
  currently_reading: "Currently Reading",
  want_to_read: "Want to Read",
  read: "Read",
};

export function SearchBookCard({ volume }: { volume: GoogleBooksVolume }) {
  const [added, setAdded] = useState<Book["shelf"] | null>(null);
  const info = volume.volumeInfo;
  const cover = info.imageLinks?.thumbnail?.replace("http:", "https:");

  async function addToShelf(shelf: Book["shelf"]) {
    const book = volumeToBook(volume, shelf);
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    if (res.ok) { setAdded(shelf); toast.success(`Added to "${SHELF_LABELS[shelf]}"`); }
    else toast.error("Failed to add book");
  }

  return (
    <div className="flex gap-4 p-4 rounded-2xl transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
    >
      {/* Cover */}
      <div className="relative w-14 flex-shrink-0">
        <div className="aspect-[2/3] rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
          {cover ? (
            <Image src={cover} alt={info.title} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white/20" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[14px] text-white/90 line-clamp-1">{info.title}</h3>
        <p className="text-[12px] text-white/40 mt-0.5">{info.authors?.join(", ") ?? "Unknown author"}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {info.publishedDate && (
            <span className="text-[11px] text-white/25">{info.publishedDate.slice(0, 4)}</span>
          )}
          {info.pageCount && (
            <span className="text-[11px] text-white/25">· {info.pageCount} pages</span>
          )}
        </div>
        {info.description && (
          <p className="text-[12px] text-white/35 mt-2 line-clamp-2 leading-relaxed">{info.description}</p>
        )}
      </div>

      {/* Add button */}
      <div className="flex-shrink-0 flex items-center self-start pt-0.5">
        {added ? (
          <div className="flex items-center gap-1.5 text-[12px] text-amber-400 font-medium">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)" }}>
              <Check className="w-3 h-3" />
            </div>
            <span className="hidden sm:inline">Added</span>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1.5 text-[12px] font-medium text-amber-400 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
              <ChevronDown className="w-3 h-3 text-amber-400/60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
              style={{ background: "rgba(18,18,28,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
              className="text-white/80 min-w-[160px]">
              {(["currently_reading", "want_to_read", "read"] as const).map((s) => (
                <DropdownMenuItem key={s} onClick={() => addToShelf(s)}
                  className="hover:bg-white/5 hover:text-white cursor-pointer text-[13px]">
                  {SHELF_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
