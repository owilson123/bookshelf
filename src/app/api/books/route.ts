import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Book, Shelf } from "@/lib/types";

export async function GET(req: NextRequest) {
  const shelf = req.nextUrl.searchParams.get("shelf") as Shelf | null;
  try {
    const books = shelf
      ? await sql`SELECT * FROM books WHERE shelf = ${shelf} ORDER BY date_added DESC`
      : await sql`SELECT * FROM books ORDER BY date_added DESC`;
    return NextResponse.json(books);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Omit<Book, "date_added"> = await req.json();
    await sql`
      INSERT INTO books (id, title, author, cover_url, description, page_count,
        published_date, publisher, genres, isbn, google_books_id, shelf, rating,
        date_read, current_page, notes, source)
      VALUES (
        ${body.id}, ${body.title}, ${body.author}, ${body.cover_url},
        ${body.description}, ${body.page_count}, ${body.published_date},
        ${body.publisher}, ${body.genres as string[]}, ${body.isbn},
        ${body.google_books_id}, ${body.shelf}, ${body.rating},
        ${body.date_read}, ${body.current_page ?? 0}, ${body.notes},
        ${body.source ?? "manual"}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
