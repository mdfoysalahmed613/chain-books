"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import type { PurchaseWithBook } from "@/lib/types";
import { Download, BookOpen } from "lucide-react";
import Image from "next/image";

export default function PurchasesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [purchases, setPurchases] = useState<PurchaseWithBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function loadPurchases() {
      const { data } = await supabase
        .from("purchases")
        .select("*, books(*)")
        .eq("user_id", user!.id)
        .eq("payment_status", "completed")
        .order("purchased_at", { ascending: false });

      setPurchases((data as PurchaseWithBook[]) || []);
      setLoading(false);
    }

    loadPurchases();
  }, [user, authLoading, router, supabase]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
        <p className="mt-2 text-muted-foreground">
          Download your purchased books
        </p>
      </div>

      {purchases.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="aspect-16/8 bg-muted/50 relative overflow-hidden">
                {purchase.books.cover_image_url ? (
                  <Image
                    src={purchase.books.cover_image_url}
                    alt={purchase.books.title}
                    className="h-full w-full object-cover"
                    fill
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 to-primary/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{purchase.books.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" asChild>
                    <Link
                      href={purchase.books.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No purchases yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our store and buy your first book
          </p>
          <Button className="mt-4" size="sm" asChild>
            <Link href="/store">Browse Books</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
