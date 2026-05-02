import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSessionUserDoc, unauthorized, misconfigured, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return misconfigured(
        "Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server environment."
      );
    }

    const amountPaise = Number(process.env.RAZORPAY_PREMIUM_AMOUNT_PAISE ?? "9900");
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return misconfigured("Invalid RAZORPAY_PREMIUM_AMOUNT_PAISE.");
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `cr_${String(user._id).slice(0, 18)}_${Date.now()}`,
      notes: {
        userId: String(user._id),
        email: user.email,
      },
    });

    const pub = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!pub) {
      return misconfigured("Add NEXT_PUBLIC_RAZORPAY_KEY_ID (same as Key Id from Razorpay dashboard) for checkout.");
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: pub,
    });
  } catch (e) {
    console.error(e);
    return serverError("Could not create payment order.");
  }
}
