export type Book = {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  long_description: string | null;
  price: number;
  cover_image_url: string | null;
  download_url: string;
  category: string;
  page_count: number | null;
  created_at: string;
  updated_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  book_id: string;
  session_id: string | null;
  payment_id: string | null;
  payment_status: string;
  amount: number;
  currency: string;
  purchased_at: string;
};

export type PurchaseWithBook = Purchase & {
  books: Book;
};
