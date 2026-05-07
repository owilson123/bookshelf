import { GoogleBooksVolume, Book } from "./types";
import { nanoid } from "./utils-server";

const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1";

export async function searchBooks(query: string): Promise<GoogleBooksVolume[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=12${key ? `&key=${key}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

export async function getBookById(id: string): Promise<GoogleBooksVolume | null> {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_BASE}/volumes/${id}${key ? `?key=${key}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export function volumeToBook(vol: GoogleBooksVolume, shelf: Book["shelf"] = "want_to_read"): Omit<Book, "date_added"> {
  const info = vol.volumeInfo;
  const isbn = info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ?? null;
  const cover = info.imageLinks?.thumbnail?.replace("http:", "https:") ?? null;
  return {
    id: nanoid(),
    title: info.title,
    author: info.authors?.join(", ") ?? "Unknown",
    cover_url: cover,
    description: info.description ?? null,
    page_count: info.pageCount ?? null,
    published_date: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    genres: info.categories ?? null,
    isbn,
    google_books_id: vol.id,
    shelf,
    rating: null,
    date_read: null,
    current_page: 0,
    notes: null,
    source: "google_books",
  };
}
