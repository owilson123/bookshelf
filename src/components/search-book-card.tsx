"use client";

import { GoogleBooksVolume, Book } from "@/lib/types";
import { BookOpen, Plus, Check } from "lucide-react";
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

  async function addToShelf(shelf: Book["shelf"]) {
    const book = volumeToBook(volume, shelf);
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    if (res.ok) {
      setAdded(shelf);
      toast.success(`Added to "${SHELF_LABELS[shelf]}"`);
    } else {
      toast.error("Failed to add book");
    }
  }

  const cover = info.imageLinks?.thumbnail?.replace("http:", "https:");

  return (
    <div className="flex gap-4 p-4 bg-[#161b22] border border-white/5 rounded-xl hover:border-amber-400/20 transition-all duration-200">
      <div className="relative w-16 flex-shrink-0">
        <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#0d1117]">
          {cover ? (
            <Image src={cover} alt={info.title} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white/20" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-[#e6e1d3] line-clamp-2">{info.title}</h3>
        <p className="text-xs text-[#8b8685] mt-0.5">{info.authors?.join(", ") ?? "Unknown author"}</p>
        {info.publishedDate && <p className="text-xs text-white/30 mt-0.5">{info.publishedDate.slice(0, 4)}</p>}
        {info.pageCount && <p className="text-xs text-white/30">{info.pageCount} pages</p>}
        {info.description && (
          <p className="text-xs text-[#8b8685] mt-2 line-clamp-2">{info.description}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-start pt-1">
        {added ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Added</span>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#161b22] border-white/10 text-[#e6e1d3]">
              {(["currently_reading", "want_to_read", "read"] as const).map((s) => (
                <DropdownMenuItem key={s} onClick={() => addToShelf(s)} className="hover:bg-white/5 cursor-pointer text-sm">
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
