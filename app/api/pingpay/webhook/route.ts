import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-ping-signature");
    const timestamp = request.headers.get("x-ping-timestamp");
    const rawBody = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.PINGPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature && timestamp) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const body = JSON.parse(rawBody);

    // PingPay webhook payload: { id, type, resourceId, data, createdAt }
    const eventType = body.type;
    const resourceId = body.resourceId;

    if (!eventType) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Try to find purchase by payment_id (resourceId from webhook)
    let purchase = null;
    let lookupError = null;

    if (resourceId) {
      const result = await supabase
        .from("purchases")
        .select("id, payment_status")
        .eq("payment_id", resourceId)
        .single();

      purchase = result.data;
      lookupError = result.error;
    }

    // Fallback: try session_id from data payload
    if (!purchase && body.data?.sessionId) {
      const result = await supabase
        .from("purchases")
        .select("id, payment_status")
        .eq("session_id", body.data.sessionId)
        .single();

      purchase = result.data;
      lookupError = result.error;
    }

    if (lookupError || !purchase) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: if already completed, do not process again
    if (purchase.payment_status === "completed") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Map event to status
    let paymentStatus: string;
    if (
      eventType === "payment.success" ||
      eventType === "checkout.session.completed"
    ) {
      paymentStatus = "completed";
    } else if (
      eventType === "payment.failed" ||
      eventType === "checkout.session.expired"
    ) {
      paymentStatus = "failed";
    } else {
      return NextResponse.json({
        success: true,
        message: "Event acknowledged",
      });
    }

    const { error: updateError } = await supabase
      .from("purchases")
      .update({ payment_status: paymentStatus })
      .eq("id", purchase.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update purchase" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
