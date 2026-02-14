"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Book } from "@/lib/types";
import { ArrowLeft, BookOpen, ShoppingCart, User, FileText } from "lucide-react";
import Image from "next/image";

export default function BookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .single();

      setBook(data as Book | null);

      if (data && user) {
        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_id", data.id)
          .eq("payment_status", "completed")
          .single();

        setPurchased(!!purchase);
      }

      setLoading(false);
    }

    load();
  }, [slug, user, supabase]);

  async function handleBuy() {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    if (!book) return;

    setPurchasing(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "already_purchased") {
          setPurchased(true);
          setPurchasing(false);
          return;
        }
        setError("Payment session failed. Please try again.");
        setPurchasing(false);
        return;
      }

      if(!data.session_url) {
        setError("Payment session failed. Please try again.");
        setPurchasing(false);
        return;
      }

      window.location.href = data.session_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-3/4 rounded-xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
        <h1 className="text-2xl font-bold">Book not found</h1>
        <p className="mt-2 text-muted-foreground">
          The book you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-8">
        <Link href="/store" className="gap-1">
          <ArrowLeft className="h-3 w-3" />
          Back to Books
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Cover */}
        <div className="lg:col-span-3">
          <div className="aspect-3/4 max-w-md mx-auto overflow-hidden rounded-xl border bg-muted/50">
            {book.cover_image_url ? (
              <Image
                src={book.cover_image_url}
                alt={book.title}
                className="h-full w-full object-cover"
                width={400}
                height={533}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-primary/5 to-primary/10">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-primary">{book.title}</p>
                </div>
              </div>
            )}
          </div>

          {/* Long description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">About this book</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {book.long_description || book.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{book.description}</p>

            <Separator className="my-5" />

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">{book.price}</span>
              <span className="text-sm text-muted-foreground">NEAR</span>
            </div>

            <div className="mt-5 space-y-2">
              {purchased ? (
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button className="w-full gap-2" onClick={handleBuy} disabled={purchasing}>
                  <ShoppingCart className="h-4 w-4" />
                  {purchasing ? "Processing..." : "Buy with NEAR"}
                </Button>
              )}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>

            <Separator className="my-5" />

            {/* Book metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Author:</span>
                <span className="font-medium">{book.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="text-xs">
                  {book.category}
                </Badge>
              </div>
              {book.page_count && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium">{book.page_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
