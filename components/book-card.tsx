import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/lib/types";
import Image from "next/image";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/store/${book.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/30">
        <div className="aspect-3/4 bg-muted/50 relative overflow-hidden">
          {book.cover_image_url ? (
            <Image
              src={book.cover_image_url}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              fill
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-xl font-bold text-primary">
                    {book.title[0]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors truncate">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {book.author}
              </p>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">
              {book.price} NEAR
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {book.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {book.category}
            </Badge>
            {book.page_count && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {book.page_count} pages
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
