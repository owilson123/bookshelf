"use client";

import { useState, useCallback } from "react";
import { SearchBookCard } from "@/components/search-book-card";
import { GoogleBooksVolume } from "@/lib/types";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBooksVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#e6e1d3]">Search Books</h1>
        <p className="text-[#8b8685] mt-1">Find books to add to your shelves via Google Books.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8685]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or ISBN…"
          className="pl-9 bg-[#161b22] border-white/10 text-[#e6e1d3] placeholder:text-[#8b8685] focus-visible:border-amber-400/50 focus-visible:ring-0"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((vol) => (
            <SearchBookCard key={vol.id} volume={vol} />
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-[#8b8685] py-12">No results for "{query}"</p>
      )}

      {!query && (
        <div className="text-center py-16 text-[#8b8685]">
          <Search className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p>Start typing to search for books</p>
        </div>
      )}
    </div>
  );
}
