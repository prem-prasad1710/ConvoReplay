import { NextResponse } from "next/server";
import { getSessionUserDoc, unauthorized } from "@/lib/api-helpers";
import { FREE_ANALYSES_PER_MONTH, refreshMonthlyUsage } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUserDoc();
  if (!user) return unauthorized();

  refreshMonthlyUsage(user);
  const remainingFree = Math.max(0, FREE_ANALYSES_PER_MONTH - user.freeAnalysesUsed);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      credits: user.credits,
      usage: {
        month: user.usageMonth,
        freeAnalysesUsed: user.freeAnalysesUsed,
        freeAnalysesRemaining: user.plan === "premium" ? null : remainingFree,
        freeLimit: user.plan === "premium" ? null : FREE_ANALYSES_PER_MONTH,
      },
    },
  });
}
