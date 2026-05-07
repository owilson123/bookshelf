"use client";

import { Book } from "@/lib/types";
import { Star, BookOpen, Clock, CheckCheck, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const SHELF_ICONS = {
  currently_reading: BookOpen,
  want_to_read: Clock,
  read: CheckCheck,
};

function StarRating({ rating, onChange }: { rating: number | null; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} className="group">
          <Star
            className={`w-3.5 h-3.5 transition-colors ${
              (rating ?? 0) >= n ? "fill-amber-400 text-amber-400" : "text-white/20 group-hover:text-amber-400/60"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const Icon = SHELF_ICONS[book.shelf];
  const pct = book.page_count && book.current_page ? Math.min(100, Math.round((book.current_page / book.page_count) * 100)) : 0;

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
    if (res.ok) {
      toast.success(`Moved to "${SHELF_LABELS[shelf]}"`);
      router.refresh();
    }
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
    if (res.ok) {
      toast.success("Book removed");
      router.refresh();
    }
  }

  return (
    <div className="group relative flex flex-col bg-[#161b22] border border-white/5 rounded-xl overflow-hidden hover:border-amber-400/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/5">
      <div className="relative aspect-[2/3] bg-[#0d1117] overflow-hidden">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <BookOpen className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-[#0d1117]/80 backdrop-blur-sm rounded-lg p-1.5 text-white/70 hover:text-white transition-colors">
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#161b22] border-white/10 text-[#e6e1d3]">
              {(["currently_reading", "want_to_read", "read"] as const).filter((s) => s !== book.shelf).map((s) => (
                <DropdownMenuItem key={s} onClick={() => moveToShelf(s)} className="hover:bg-white/5 cursor-pointer">
                  Move to {SHELF_LABELS[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={deleteBook} className="text-red-400 hover:bg-red-400/10 cursor-pointer">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-[#e6e1d3]">{book.title}</h3>
          <p className="text-xs text-[#8b8685] mt-0.5 line-clamp-1">{book.author}</p>
        </div>

        {book.shelf === "currently_reading" && book.page_count ? (
          <div className="space-y-1">
            <Progress value={pct} className="h-1 bg-white/10 [&>div]:bg-amber-400" />
            <p className="text-xs text-[#8b8685]">
              {book.current_page}/{book.page_count} pages · {pct}%
            </p>
          </div>
        ) : null}

        {book.shelf === "read" ? (
          <StarRating rating={book.rating} onChange={setRating} />
        ) : (
          <Badge variant="outline" className="w-fit text-xs border-white/10 text-[#8b8685] gap-1 px-2 py-0.5">
            <Icon className="w-3 h-3" />
            {SHELF_LABELS[book.shelf]}
          </Badge>
        )}

        {book.page_count && (
          <p className="text-xs text-white/30 mt-auto">{book.page_count} pages</p>
        )}
      </div>
    </div>
  );
}
