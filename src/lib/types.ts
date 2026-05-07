export type Shelf = "currently_reading" | "read" | "want_to_read";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  page_count: number | null;
  published_date: string | null;
  publisher: string | null;
  genres: string[] | null;
  isbn: string | null;
  google_books_id: string | null;
  shelf: Shelf;
  rating: number | null;
  date_read: string | null;
  date_added: string;
  current_page: number;
  notes: string | null;
  source: string;
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    publishedDate?: string;
    publisher?: string;
    categories?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}
