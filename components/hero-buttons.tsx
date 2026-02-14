"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroButtons() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/store">
            Browse Books
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Button size="lg" asChild>
        <Link href="/store">
          Browse Books
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
      {!user && (
        <Button size="lg" variant="outline" asChild>
          <Link href="/auth/login">Get Started</Link>
        </Button>
      )}
    </div>
  );
}
