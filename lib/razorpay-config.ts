/**
 * Razorpay dashboard exposes one "Key Id" (rzp_…). You may set it as either
 * RAZORPAY_KEY_ID (server) or NEXT_PUBLIC_RAZORPAY_KEY_ID (client bundle) — same value.
 */
export function getRazorpayKeyId(): string | undefined {
  const server = process.env.RAZORPAY_KEY_ID?.trim();
  const publicId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  return server || publicId || undefined;
}

export function getRazorpayKeySecret(): string | undefined {
  const s = process.env.RAZORPAY_KEY_SECRET?.trim();
  return s || undefined;
}

/** True when Key Id + Key Secret are present (either Key Id env name is fine). */
export function isRazorpayKeysConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}
