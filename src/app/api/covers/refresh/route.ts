export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { fetchCoverUrl } from "@/lib/covers";

export async function POST() {
  try {
    const missing = await sql`
      SELECT id, title, author, isbn FROM books
      WHERE cover_url IS NULL OR cover_url = ''
      LIMIT 50
    `;

    let updated = 0;
    for (const book of missing) {
      const coverUrl = await fetchCoverUrl({
        title: book.title as string,
        author: book.author as string,
        isbn: book.isbn as string | null,
      });
      if (coverUrl) {
        await sql`UPDATE books SET cover_url = ${coverUrl} WHERE id = ${book.id}`;
        updated++;
      }
    }

    const remaining = await sql`SELECT COUNT(*) as count FROM books WHERE cover_url IS NULL OR cover_url = ''`;
    return NextResponse.json({ updated, remaining: Number(remaining[0].count) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
