import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import { HeroButtons } from "@/components/hero-buttons";
import type { Book } from "@/lib/types";
import {
  ArrowRight,
  Zap,
  Shield,
  BookOpen,
  Blocks,
  Wallet,
  Download,
} from "lucide-react";

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
        {/* Animated grid background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
              <Blocks className="h-3.5 w-3.5 text-primary" />
              <span>Powered by NEAR Protocol</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The Bookstore{" "}
              <span className="relative">
                <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  on the Blockchain
                </span>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Buy curated e-books with crypto. Instant downloads, transparent payments,
              and no middlemen &mdash; just you and your next great read.
            </p>

            <HeroButtons />

            {/* Stats row */}
            <div className="mt-12 flex items-center justify-center gap-8 text-center sm:gap-12">
              <div>
                <p className="text-2xl font-bold sm:text-3xl">0%</p>
                <p className="mt-0.5 text-xs text-muted-foreground">DRM Lock-in</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold sm:text-3xl">NEAR</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Native Payments</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold sm:text-3xl">&lt;30s</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Checkout Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">How it works</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Three steps to your next book
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              No complicated onboarding. No credit card forms. Just pick, pay, and read.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative rounded-xl border bg-card p-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div className="mx-auto mb-4 mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Browse &amp; Choose</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Explore our curated collection of books on blockchain, programming, AI, and design.
              </p>
            </div>

            <div className="relative rounded-xl border bg-card p-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div className="mx-auto mb-4 mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Pay with Crypto</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Complete your purchase with wNEAR through PingPay&apos;s secure, decentralized checkout.
              </p>
            </div>

            <div className="relative rounded-xl border bg-card p-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div className="mx-auto mb-4 mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Download Instantly</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Get instant PDF access from your dashboard. No wait times, no DRM hassle.
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
              <Badge variant="secondary" className="mb-3">Collection</Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Books</h2>
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

      {/* Why ChainBooks */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">Why ChainBooks</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built different, on purpose
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <Zap className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">Instant Access</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Payment confirms in seconds. Your PDF is ready to download immediately from your dashboard.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <Shield className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Every transaction goes through PingPay&apos;s verified checkout with webhook confirmation.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <Blocks className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-semibold">On-Chain Transparency</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Payments settle on NEAR Protocol. Fully verifiable, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to start reading?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Browse our collection and pay with crypto in under 30 seconds.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/store">
                  Explore Books
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
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
