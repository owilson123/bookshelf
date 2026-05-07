import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Lazy proxy so the module can be imported at build time without DATABASE_URL
function lazyQuery(...args: Parameters<NeonQueryFunction<false, false>>) {
  return getDb()(...args);
}

export const sql = lazyQuery as unknown as NeonQueryFunction<false, false>;

export async function initDb() {
  const db = getDb();
  await db`
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
