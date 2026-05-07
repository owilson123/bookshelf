export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/google-books";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  try {
    const results = await searchBooks(q);
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
