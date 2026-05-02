import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay-webhook";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

/** Razorpay sends subscription lifecycle events; activate Premium when payment succeeds. */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: {
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          current_end?: number;
          notes?: Record<string, string>;
        };
      };
      payment?: { entity?: { id?: string; status?: string; email?: string; notes?: Record<string, string> } };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event ?? "";
  const subEntity = payload.payload?.subscription?.entity;
  const notes = subEntity?.notes ?? payload.payload?.payment?.entity?.notes;
  const userId = notes?.userId;

  const premiumEvents = new Set([
    "subscription.activated",
    "subscription.charged",
    "subscription.resumed",
    "invoice.paid",
    "payment.captured",
  ]);

  const cancelHint = new Set(["subscription.cancelled", "subscription.completed", "subscription.halted"]);

  try {
    await connectDb();

    if (userId && typeof userId === "string" && premiumEvents.has(event)) {
      const until =
        subEntity?.current_end != null
          ? new Date(subEntity.current_end * 1000)
          : new Date(Date.now() + 32 * 24 * 60 * 60 * 1000);

      await User.findByIdAndUpdate(userId, {
        plan: "premium",
        premiumUntil: until,
        ...(subEntity?.id ? { razorpaySubscriptionId: subEntity.id } : {}),
      });
    }

    if (userId && typeof userId === "string" && cancelHint.has(event)) {
      await User.findByIdAndUpdate(userId, {
        plan: "free",
        premiumUntil: null,
        razorpaySubscriptionId: null,
      });
    }
  } catch (e) {
    console.error("webhook handler", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { message: "Razorpay webhook endpoint — POST only. Configure this URL in Razorpay Dashboard → Webhooks." },
    { status: 200 }
  );
}
