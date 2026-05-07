import { searchBooks } from "./google-books";

/** Try to get a cover URL for a book, falling back through multiple sources. */
export async function fetchCoverUrl(opts: {
  title: string;
  author: string;
  isbn?: string | null;
}): Promise<string | null> {
  const { title, author, isbn } = opts;

  // 1. Open Library by ISBN (most reliable when we have one)
  if (isbn) {
    const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
    try {
      const r = await fetch(olUrl, { method: "HEAD" });
      if (r.ok) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    } catch { /* non-fatal */ }
  }

  // 2. Google Books by ISBN
  if (isbn) {
    try {
      const results = await searchBooks(`isbn:${isbn}`);
      const cover = results[0]?.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") ?? null;
      if (cover) return cover;
    } catch { /* non-fatal */ }
  }

  // 3. Google Books by title + author
  try {
    const results = await searchBooks(`intitle:${title} inauthor:${author}`);
    const cover = results[0]?.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") ?? null;
    if (cover) return cover;
  } catch { /* non-fatal */ }

  // 4. Open Library by title (less precise but worth trying)
  try {
    const encoded = encodeURIComponent(title.slice(0, 60));
    const olUrl = `https://covers.openlibrary.org/b/title/${encoded}-L.jpg?default=false`;
    const r = await fetch(olUrl, { method: "HEAD" });
    if (r.ok) return `https://covers.openlibrary.org/b/title/${encoded}-L.jpg`;
  } catch { /* non-fatal */ }

  return null;
}
