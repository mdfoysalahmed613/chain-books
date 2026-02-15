import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const purchaseId = request.nextUrl.searchParams.get("purchase_id");
    const sessionIdParam = request.nextUrl.searchParams.get("session_id");

    if (!purchaseId && !sessionIdParam) {
      return NextResponse.json(
        { error: "purchase_id or session_id is required" },
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

    // Look up purchase by purchase_id (preferred) or session_id (fallback)
    let purchase;
    if (purchaseId) {
      const { data } = await supabase
        .from("purchases")
        .select("id, payment_status, session_id, payment_id, books(title)")
        .eq("id", purchaseId)
        .eq("user_id", user.id)
        .single();
      purchase = data;
    } else {
      const { data } = await supabase
        .from("purchases")
        .select("id, payment_status, session_id, payment_id, books(title)")
        .eq("session_id", sessionIdParam!)
        .eq("user_id", user.id)
        .single();
      purchase = data;
    }

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

    if (purchase.payment_status === "failed") {
      return NextResponse.json({
        payment_status: "failed",
        book_title: bookTitle,
      });
    }

    // If no session_id stored yet, keep polling
    if (!purchase.session_id) {
      return NextResponse.json({
        payment_status: "pending",
        book_title: bookTitle,
      });
    }

    // Poll PingPay API to check checkout session status
    const pingpayRes = await fetch(
      `https://pay.pingpay.io/api/checkout/sessions/${encodeURIComponent(purchase.session_id)}`,
      {
        headers: {
          "x-api-key": process.env.PINGPAY_API_KEY!,
        },
      },
    );

    if (!pingpayRes.ok) {
      console.error(
        "PingPay session retrieve failed:",
        pingpayRes.status,
        await pingpayRes.text(),
      );
      // Even if PingPay API fails, return current DB status so frontend keeps polling
      return NextResponse.json({
        payment_status: purchase.payment_status,
        book_title: bookTitle,
      });
    }

    const pingpayData = await pingpayRes.json();
    console.log(
      "PingPay session retrieve response for",
      purchase.session_id,
      ":",
      JSON.stringify(pingpayData),
    );

    // Handle both wrapped { session: { status } } and flat { status } responses
    const sessionObj = pingpayData.session || pingpayData;
    const sessionStatus = sessionObj.status?.toUpperCase();

    if (sessionStatus === "COMPLETED" || sessionStatus === "SUCCESS" || sessionStatus === "PAID") {
      const paymentId = sessionObj.paymentId || purchase.payment_id;

      await supabase
        .from("purchases")
        .update({
          payment_status: "completed",
          payment_id: paymentId || null,
        })
        .eq("id", purchase.id);

      return NextResponse.json({
        payment_status: "completed",
        book_title: bookTitle,
      });
    }

    if (
      sessionStatus === "EXPIRED" ||
      sessionStatus === "FAILED" ||
      sessionStatus === "CANCELLED"
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
  } catch (error) {
    console.error("GET /api/orders/verify error:", error);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 },
    );
  }
}
