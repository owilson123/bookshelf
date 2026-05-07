import { GoogleBooksVolume, Book } from "./types";

export function volumeToBook(vol: GoogleBooksVolume, shelf: Book["shelf"] = "want_to_read"): Omit<Book, "date_added"> {
  const info = vol.volumeInfo;
  const isbn = info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ?? null;
  const cover = info.imageLinks?.thumbnail?.replace("http:", "https:") ?? null;
  return {
    id: crypto.randomUUID(),
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
