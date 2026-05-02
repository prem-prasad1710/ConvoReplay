import crypto from "crypto";

/** Razorpay Dashboard → Webhooks → your endpoint → Secret (not the API Key secret). */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
  } catch {
    return expected === signature;
  }
}
