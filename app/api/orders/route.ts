import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { book_id } = body;

    if (!book_id) {
      return NextResponse.json(
        { error: "book_id is required" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch the book
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, title, slug, price")
      .eq("id", book_id)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: "book_not_found" }, { status: 404 });
    }

    // Check if user already has a completed purchase for this book
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id, payment_status, session_id")
      .eq("user_id", user.id)
      .eq("book_id", book_id)
      .single();

    if (existingPurchase) {
      if (existingPurchase.payment_status === "completed") {
        return NextResponse.json(
          { error: "already_purchased" },
          { status: 409 },
        );
      }
    }

    // Convert NEAR price to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
    const yoctoAmount = BigInt(Math.round(book.price * 1e6)) * BigInt(1e18);

    // Create PingPay checkout session
    const pingpayRes = await fetch(
      "https://pay.pingpay.io/api/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.PINGPAY_API_KEY!,
        },
        body: JSON.stringify({
          amount: yoctoAmount.toString(),
          asset: {
            chain: "NEAR",
            symbol: "wNEAR",
          },
          recipient: {
            address: process.env.PINGPAY_RECIPIENT_ADDRESS!,
            chainId: "near-mainnet",
          },
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status?session_id={sessionId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/store/${book.slug}`,
        }),
      },
    );

    if (!pingpayRes.ok) {
      console.error(
        "PingPay session creation failed:",
        await pingpayRes.text(),
      );
      return NextResponse.json(
        { error: "payment_session_failed" },
        { status: 502 },
      );
    }

    const data = await pingpayRes.json();
    const {session} = data;
    // Upsert purchase record
    if (existingPurchase) {
      await supabase
        .from("purchases")
        .update({
          session_id: session.sessionId,
          payment_id: session.paymentId || null,
          payment_status: "pending",
          amount: book.price,
        })
        .eq("id", existingPurchase.id);
    } else {
      const { error: purchaseError } = await supabase.from("purchases").insert({
        user_id: user.id,
        book_id: book.id,
        session_id: session.sessionId,
        payment_id: session.paymentId || null,
        amount: book.price,
        currency: "NEAR",
        payment_status: "pending",
      });

      if (purchaseError) {
        console.error("Purchase insert error:", purchaseError);
        return NextResponse.json(
          { error: "failed_to_create_order" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      session_id: session.sessionId,
      session_url: data.sessionUrl,
      payment_id: session.paymentId || null,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 },
    );
  }
}
