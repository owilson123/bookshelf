export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { shelf, rating, current_page, date_read, notes } = body;
    await sql`
      UPDATE books SET
        shelf = COALESCE(${shelf}, shelf),
        rating = COALESCE(${rating}, rating),
        current_page = COALESCE(${current_page}, current_page),
        date_read = COALESCE(${date_read}, date_read),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await sql`DELETE FROM books WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
