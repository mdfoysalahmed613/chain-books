import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import { HeroButtons } from "@/components/hero-buttons";
import type { Book } from "@/lib/types";
import { ArrowRight, Zap, Shield, BookOpen } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-medium">
              Pay with NEAR
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Digital Books.{" "}
              <span className="text-primary">Crypto Payments.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Curated e-books for developers, designers, and builders.
              Purchase with cryptocurrency through PingPay &mdash; fast, secure, and decentralized.
            </p>
            <HeroButtons />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Access</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Get instant PDF download access after payment. No waiting, no delays.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Crypto Payments</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Secure payments with wNEAR via PingPay. Fast and decentralized.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Curated Library</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Hand-picked books on programming, Web3, design, and AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Books</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hand-picked reads to level up your skills
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/store" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          {books && books.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(books as Book[]).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Books coming soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-2xl font-bold tracking-tight">Ready to read?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Browse our collection and find the perfect book for your next learning journey.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/store">Explore Books</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ChainBooks"
                width={42}
                height={42}
                className="h-12 w-12 rounded-md dark:brightness-110"
              />
              <span className="text-sm font-brand bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">ChainBooks</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ChainBooks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
