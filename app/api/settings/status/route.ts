import { NextResponse } from "next/server";
import { getSessionUserDoc, unauthorized } from "@/lib/api-helpers";
import { resolveGroqApiKey } from "@/lib/groq-config";
import { getResolvedMongoDbName } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * Lets the dashboard show setup banners without exposing secrets.
 */
export async function GET() {
  const user = await getSessionUserDoc();
  if (!user) return unauthorized();

  const groq = resolveGroqApiKey();
  const mongoOk = typeof process.env.MONGODB_URI === "string" && process.env.MONGODB_URI.length > 0;
  const razorpayOk =
    typeof process.env.RAZORPAY_KEY_ID === "string" &&
    process.env.RAZORPAY_KEY_ID.length > 0 &&
    typeof process.env.RAZORPAY_KEY_SECRET === "string" &&
    process.env.RAZORPAY_KEY_SECRET.length > 0 &&
    typeof process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "string" &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.length > 0;

  return NextResponse.json({
    mongoConfigured: mongoOk,
    /** Atlas database name to open in Data Explorer (after first successful write). */
    mongoDbName: mongoOk ? getResolvedMongoDbName() : null,
    groqConfigured: groq.ok,
    groqIssue: groq.ok ? null : groq.issue,
    razorpayConfigured: razorpayOk,
    authSecretWeak:
      typeof process.env.AUTH_SECRET === "string" &&
      process.env.AUTH_SECRET.length > 0 &&
      process.env.AUTH_SECRET.length < 24,
  });
}
