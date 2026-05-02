import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSessionUserDoc, unauthorized, badRequest, misconfigured, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const PREMIUM_MS = 30 * 24 * 60 * 60 * 1000;

const orderBodySchema = z.object({
  razorpay_order_id: z.string().min(8),
  razorpay_payment_id: z.string().min(8),
  razorpay_signature: z.string().min(8),
});

const subscriptionBodySchema = z.object({
  razorpay_subscription_id: z.string().min(8),
  razorpay_payment_id: z.string().min(8),
  razorpay_signature: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return misconfigured("RAZORPAY_KEY_SECRET is not set.");
    }

    const json: unknown = await req.json();

    const orderParsed = orderBodySchema.safeParse(json);
    const subParsed = subscriptionBodySchema.safeParse(json);

    let signingPayload: string;
    let razorpay_signature: string;
    if (orderParsed.success) {
      const { razorpay_order_id, razorpay_payment_id } = orderParsed.data;
      signingPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
      razorpay_signature = orderParsed.data.razorpay_signature;
    } else if (subParsed.success) {
      const { razorpay_payment_id, razorpay_subscription_id } = subParsed.data;
      signingPayload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
      razorpay_signature = subParsed.data.razorpay_signature;
    } else {
      return badRequest("Send order fields (razorpay_order_id, …) or subscription fields (razorpay_subscription_id, …).");
    }

    const expected = crypto.createHmac("sha256", secret).update(signingPayload).digest("hex");

    if (expected !== razorpay_signature) {
      return badRequest("Invalid payment signature.", "SIGNATURE_MISMATCH");
    }

    await connectDb();
    const until = new Date(Date.now() + PREMIUM_MS);

    await User.findByIdAndUpdate(user._id, {
      plan: "premium",
      premiumUntil: until,
      ...(subParsed.success ? { razorpaySubscriptionId: subParsed.data.razorpay_subscription_id } : {}),
    });

    return NextResponse.json({
      ok: true,
      premiumUntil: until.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return serverError("Could not verify payment.");
  }
}
