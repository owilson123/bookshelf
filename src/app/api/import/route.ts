export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { nanoid } from "@/lib/utils-server";
import { searchBooks } from "@/lib/google-books";
import { fetchCoverUrl } from "@/lib/covers";
import { Shelf } from "@/lib/types";

interface GoodreadsRow {
  Title: string;
  Author: string;
  "My Rating": string;
  "Date Read": string;
  Bookshelves: string;
  "Number of Pages": string;
  ISBN: string;
  ISBN13: string;
  Publisher: string;
  "Year Published": string;
  "Additional Shelves": string;
}

function mapShelf(bookshelves: string): Shelf {
  const s = bookshelves.toLowerCase();
  if (s.includes("currently-reading") || s.includes("currently reading")) return "currently_reading";
  if (s.includes("read") && !s.includes("to-read")) return "read";
  return "want_to_read";
}

function cleanIsbn(raw: string): string | null {
  if (!raw) return null;
  return raw.replace(/[^0-9X]/gi, "") || null;
}

export async function POST(req: NextRequest) {
  try {
    const { rows }: { rows: GoodreadsRow[] } = await req.json();
    let imported = 0;
    let skipped = 0;

    // Clear existing library before importing
    await sql`DELETE FROM books`;

    for (const row of rows) {
      if (!row.Title) { skipped++; continue; }
      const shelf = mapShelf(row.Bookshelves ?? "");
      const rating = parseInt(row["My Rating"] ?? "0") || null;
      const dateRead = row["Date Read"] ? new Date(row["Date Read"]).toISOString().split("T")[0] : null;
      const pageCount = parseInt(row["Number of Pages"] ?? "0") || null;
      const isbn13 = cleanIsbn(row.ISBN13);
      const isbn10 = cleanIsbn(row.ISBN);
      const isbn = isbn13 ?? isbn10;

      let coverUrl: string | null = null;
      let googleId: string | null = null;
      let description: string | null = null;
      let genres: string[] | null = null;

      // Fetch metadata from Google Books
      try {
        const query = isbn ? `isbn:${isbn}` : `intitle:${row.Title} inauthor:${row.Author}`;
        const results = await searchBooks(query);
        if (results.length > 0) {
          const vol = results[0];
          coverUrl = vol.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") ?? null;
          googleId = vol.id;
          description = vol.volumeInfo.description ?? null;
          genres = vol.volumeInfo.categories ?? null;
        }
      } catch { /* non-fatal */ }

      // If Google Books had no cover, try Open Library
      if (!coverUrl) {
        coverUrl = await fetchCoverUrl({ title: row.Title, author: row.Author, isbn });
      }

      await sql`
        INSERT INTO books (id, title, author, cover_url, description, page_count,
          published_date, publisher, genres, isbn, google_books_id, shelf, rating,
          date_read, current_page, notes, source)
        VALUES (
          ${nanoid()}, ${row.Title}, ${row.Author}, ${coverUrl},
          ${description}, ${pageCount},
          ${row["Year Published"] ?? null},
          ${row.Publisher ?? null},
          ${genres as string[]}, ${isbn},
          ${googleId}, ${shelf}, ${rating && rating > 0 ? rating : null},
          ${dateRead}, 0, null, 'goodreads'
        )
        ON CONFLICT DO NOTHING
      `;
      imported++;
    }

    return NextResponse.json({ imported, skipped });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
