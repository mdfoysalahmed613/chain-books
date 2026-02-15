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
    if (!webhookSecret || !signature || !timestamp) {
      console.error("Webhook missing signature or secret");
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 401 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    console.log("PingPay webhook received:", JSON.stringify(body));

    // PingPay webhook payload can be:
    // Standard: { id, type, resourceId, data, createdAt }
    // Flat:     { paymentId, status, sessionId, ... }
    let eventType = body.type;
    const resourceId = body.resourceId;

    // If no event type in wrapper, infer from flat payload status
    if (!eventType && body.status) {
      const status = body.status.toUpperCase();
      if (status === "SUCCESS" || status === "COMPLETED" || status === "PAID") {
        eventType = "payment.success";
      } else if (status === "FAILED" || status === "EXPIRED" || status === "CANCELLED") {
        eventType = "payment.failed";
      } else if (status === "PENDING") {
        eventType = "payment.pending";
      }
    }

    if (!eventType) {
      console.error("Webhook missing event type:", JSON.stringify(body));
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Extract sessionId and paymentId from all possible locations
    // Standard wrapper: body.data.sessionId, body.resourceId
    // Flat payload: body.sessionId, body.paymentId
    const sessionId =
      body.data?.sessionId || body.sessionId || body.data?.session_id;
    const paymentId =
      resourceId || body.paymentId || body.data?.paymentId || body.data?.payment_id;

    let purchase = null;

    // Try to find purchase by session_id first (most reliable, always stored)
    if (sessionId) {
      const result = await supabase
        .from("purchases")
        .select("id, payment_status")
        .eq("session_id", sessionId)
        .single();

      purchase = result.data;
    }

    // Fallback: try payment_id (resourceId from webhook)
    if (!purchase && paymentId) {
      const result = await supabase
        .from("purchases")
        .select("id, payment_status")
        .eq("payment_id", paymentId)
        .single();

      purchase = result.data;
    }

    if (!purchase) {
      console.error(
        "Webhook: purchase not found. sessionId:",
        sessionId,
        "paymentId:",
        paymentId,
      );
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

    // Update purchase status and save the payment_id
    const { error: updateError } = await supabase
      .from("purchases")
      .update({
        payment_status: paymentStatus,
        payment_id: paymentId || null,
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("Webhook: failed to update purchase:", updateError);
      return NextResponse.json(
        { error: "Failed to update purchase" },
        { status: 500 },
      );
    }

    console.log(
      "Webhook: purchase updated to",
      paymentStatus,
      "for purchase",
      purchase.id,
    );

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
