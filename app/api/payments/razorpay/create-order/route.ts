import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSessionUserDoc, unauthorized, misconfigured, serverError } from "@/lib/api-helpers";
import { getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/razorpay-config";

export const dynamic = "force-dynamic";

/** Browser prefetch / opening this URL uses GET — explain POST-only. */
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message:
          "Create order with POST only (use the Subscribe button). Razorpay checkout receives the key from that response.",
      },
    },
    { status: 405, headers: { Allow: "POST, OPTIONS" } }
  );
}

export async function POST() {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();
    if (!keyId || !keySecret) {
      return misconfigured(
        "Add RAZORPAY_KEY_SECRET and your Razorpay Key Id: set RAZORPAY_KEY_ID or NEXT_PUBLIC_RAZORPAY_KEY_ID (same rzp_… value from Dashboard → API Keys) in Vercel Production, then redeploy."
      );
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const publishableKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId;

    const planId = process.env.RAZORPAY_PREMIUM_PLAN_ID?.trim();
    if (planId) {
      const totalCountRaw = process.env.RAZORPAY_SUBSCRIPTION_TOTAL_COUNT ?? "120";
      const totalCount = Number(totalCountRaw);
      if (!Number.isFinite(totalCount) || totalCount < 1) {
        return misconfigured("Invalid RAZORPAY_SUBSCRIPTION_TOTAL_COUNT (positive integer, e.g. 120).");
      }

      const sub = await rzp.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: totalCount,
        quantity: 1,
        notes: {
          userId: String(user._id),
          email: user.email,
        },
      });

      return NextResponse.json({
        mode: "subscription" as const,
        subscriptionId: sub.id,
        keyId: publishableKey,
      });
    }

    const amountPaise = Number(process.env.RAZORPAY_PREMIUM_AMOUNT_PAISE ?? "9900");
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return misconfigured("Invalid RAZORPAY_PREMIUM_AMOUNT_PAISE (use paise, e.g. 9900 for ₹99).");
    }

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `cr_${String(user._id).slice(0, 18)}_${Date.now()}`,
      notes: {
        userId: String(user._id),
        email: user.email,
      },
    });

    return NextResponse.json({
      mode: "order" as const,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: publishableKey,
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Could not create payment order.";
    if (/bad request|invalid/i.test(msg)) {
      return misconfigured(
        `Razorpay rejected the request: ${msg}. Check Key Id / Key Secret (test vs live match) in the dashboard.`
      );
    }
    return serverError(msg);
  }
}
