import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 },
      );
    }

    const supabaseAuth = await createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check if already completed in our database
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, payment_status, session_id, books(title)")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!purchase) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookTitle = (purchase as any).books?.title || null;

    if (purchase.payment_status === "completed") {
      return NextResponse.json({
        payment_status: "completed",
        book_title: bookTitle,
      });
    }

    // Poll PingPay API to check checkout session status
    const pingpayRes = await fetch(
      `https://pay.pingpay.io/api/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          "x-api-key": process.env.PINGPAY_API_KEY!,
        },
      },
    );

    if (!pingpayRes.ok) {
      return NextResponse.json({
        payment_status: purchase.payment_status,
        book_title: bookTitle,
      });
    }

    const pingpayData = await pingpayRes.json();
    const sessionStatus = pingpayData.session?.status;

    if (sessionStatus === "COMPLETED" || sessionStatus === "completed") {
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: "completed",
          payment_id: pingpayData.session?.paymentId || null,
        })
        .eq("id", purchase.id);

      if (updateError) {
        return NextResponse.json({
          payment_status: purchase.payment_status,
          book_title: bookTitle,
        });
      }

      return NextResponse.json({
        payment_status: "completed",
        book_title: bookTitle,
      });
    }

    if (
      sessionStatus === "EXPIRED" ||
      sessionStatus === "expired" ||
      sessionStatus === "FAILED" ||
      sessionStatus === "failed"
    ) {
      await supabase
        .from("purchases")
        .update({ payment_status: "failed" })
        .eq("id", purchase.id);

      return NextResponse.json({
        payment_status: "failed",
        book_title: bookTitle,
      });
    }

    return NextResponse.json({
      payment_status: purchase.payment_status,
      book_title: bookTitle,
    });
  } catch {
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 },
    );
  }
}
