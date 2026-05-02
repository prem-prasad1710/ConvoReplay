import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSessionUserDoc, unauthorized, badRequest, misconfigured, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const PREMIUM_MS = 30 * 24 * 60 * 60 * 1000;

const bodySchema = z.object({
  razorpay_order_id: z.string().min(8),
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

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload.");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return badRequest("Invalid payment signature.", "SIGNATURE_MISMATCH");
    }

    await connectDb();
    const until = new Date(Date.now() + PREMIUM_MS);

    await User.findByIdAndUpdate(user._id, {
      plan: "premium",
      premiumUntil: until,
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
