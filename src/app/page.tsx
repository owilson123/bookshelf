export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import { Book } from "@/lib/types";
import { BookCard } from "@/components/book-card";
import { CurrentlyReadingCard } from "@/components/currently-reading-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, CheckCheck, BookMarked } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1d3]">My Bookshelf</h1>
          <p className="text-[#8b8685] mt-1">
            {books.length === 0
              ? "No books yet — search to add one or import from Goodreads"
              : `${books.length} book${books.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex gap-4 text-sm text-[#8b8685]">
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-amber-400" />{currentlyReading.length} reading</span>
          <span className="flex items-center gap-1.5"><CheckCheck className="w-4 h-4 text-green-400" />{read.length} read</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-400" />{wantToRead.length} to read</span>
        </div>
      </div>

      {currentlyReading.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Currently Reading
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentlyReading.map((book) => (
              <CurrentlyReadingCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {books.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e6e1d3] mb-2">Your shelf is empty</h2>
          <p className="text-[#8b8685] mb-6">Start by searching for books or importing your Goodreads library.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/search" className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Search Books
            </Link>
            <Link href="/import" className="bg-white/5 hover:bg-white/10 text-[#e6e1d3] border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Import CSV
            </Link>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="bg-[#161b22] border border-white/5">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">All ({books.length})</TabsTrigger>
            <TabsTrigger value="want_to_read" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">Want to Read ({wantToRead.length})</TabsTrigger>
            <TabsTrigger value="read" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">Read ({read.length})</TabsTrigger>
          </TabsList>

          {[
            { value: "all", items: books },
            { value: "want_to_read", items: wantToRead },
            { value: "read", items: read },
          ].map(({ value, items }) => (
            <TabsContent key={value} value={value} className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              {items.length === 0 && (
                <p className="text-center py-12 text-[#8b8685]">No books here yet.</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
