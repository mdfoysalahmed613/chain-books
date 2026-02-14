import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import type { Book } from "@/lib/types";

export default async function StorePage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Books</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of e-books
        </p>
      </div>

      {books && books.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(books as Book[]).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">No books available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
