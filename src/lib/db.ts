import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_url TEXT,
      description TEXT,
      page_count INTEGER,
      published_date TEXT,
      publisher TEXT,
      genres TEXT[],
      isbn TEXT,
      google_books_id TEXT,
      shelf TEXT NOT NULL DEFAULT 'want_to_read',
      rating INTEGER CHECK (rating >= 0 AND rating <= 5),
      date_read DATE,
      date_added TIMESTAMPTZ DEFAULT NOW(),
      current_page INTEGER DEFAULT 0,
      notes TEXT,
      source TEXT DEFAULT 'manual'
    )
  `;
}
