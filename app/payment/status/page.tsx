"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type PaymentState = "polling" | "completed" | "failed" | "not_found" | "timeout";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { loading: authLoading } = useAuth();

  const [status, setStatus] = useState<PaymentState>("polling");
  const [bookTitle, setBookTitle] = useState<string>("");
  const notFoundCountRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return;
    if (authLoading) return;

    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    async function checkStatus(): Promise<PaymentState> {
      try {
        const res = await fetch(`/api/orders/verify?session_id=${encodeURIComponent(sessionId!)}`);

        if (res.ok) {
          const result = await res.json();
          if (result.book_title) {
            setBookTitle(result.book_title);
          }
          if (result.payment_status === "completed") return "completed";
          if (result.payment_status === "failed") return "failed";
          if (result.payment_status === "pending") {
            notFoundCountRef.current = 0;
            return "polling";
          }
        }

        if (res.status === 404) {
          notFoundCountRef.current += 1;
          if (notFoundCountRef.current >= 10) {
            return "not_found";
          }
          return "polling";
        }

        if (res.status === 401) {
          return "polling";
        }

        return "polling";
      } catch {
        return "polling";
      }
    }

    async function poll() {
      const result = await checkStatus();
      if (cancelled) return;

      if (result !== "polling") {
        setStatus(result);
        return;
      }

      timeoutId = setTimeout(poll, 3000);
    }

    poll();

    const maxTimeout = setTimeout(() => {
      cancelled = true;
      setStatus("timeout");
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      clearTimeout(maxTimeout);
    };
  }, [sessionId, authLoading]);

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Invalid Payment Link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No payment reference found. Please try purchasing again.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {status === "polling" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-6 text-xl font-bold">Payment Pending</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Waiting for payment confirmation from the network.
            This may take a moment.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/store">Back to Store</Link>
            </Button>
          </div>
        </>
      )}

      {status === "completed" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-6 text-xl font-bold">Payment Successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bookTitle
              ? `Your purchase of "${bookTitle}" is confirmed.`
              : "Your payment has been confirmed."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/store">Continue Shopping</Link>
            </Button>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-6 text-xl font-bold">Payment Failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment could not be processed. Please try again.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/store">Back to Store</Link>
            </Button>
          </div>
        </>
      )}

      {status === "not_found" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-6 text-xl font-bold">Order Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find this payment. It may have expired.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/store">Back to Store</Link>
          </Button>
        </>
      )}

      {status === "timeout" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-6 text-xl font-bold">Verification Taking Longer Than Expected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment may still be processing. Check your dashboard
            in a few minutes to see if the purchase was confirmed.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/store">Back to Store</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-6 text-xl font-bold">Loading...</h1>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
