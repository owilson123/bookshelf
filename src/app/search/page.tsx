"use client";

import { useState, useEffect } from "react";
import { SearchBookCard } from "@/components/search-book-card";
import { GoogleBooksVolume } from "@/lib/types";
import { Search, Loader2, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const SUGGESTIONS = ["Dune", "The Midnight Library", "Atomic Habits", "Project Hail Mary", "Normal People"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBooksVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Search Books</h1>
        <p className="text-white/40 mt-2 text-[15px]">Find books to add to your shelves via Google Books.</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            : <Search className="w-4 h-4" />}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or ISBN…"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[15px] text-white placeholder:text-white/25 outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={e => (e.currentTarget.style.border = "1px solid rgba(245,158,11,0.3)")}
          onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((vol) => (
            <SearchBookCard key={vol.id} volume={vol} />
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/30 text-[14px]">No results for "<span className="text-white/50">{query}</span>"</p>
        </div>
      )}

      {/* Empty state with suggestions */}
      {!query && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.1)" }}>
              <Search className="w-7 h-7 text-amber-400/30" />
            </div>
            <p className="text-white/30 text-[14px]">Start typing to search millions of books</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/20 mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Try searching for
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQuery(s)}
                  className="text-[13px] text-white/50 hover:text-white/80 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
