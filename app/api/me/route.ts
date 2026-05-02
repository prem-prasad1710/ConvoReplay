import { NextResponse } from "next/server";
import { getSessionUserDoc, unauthorized } from "@/lib/api-helpers";
import { FREE_ANALYSES_PER_MONTH, effectivePlan, refreshMonthlyUsage } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUserDoc();
  if (!user) return unauthorized();

  refreshMonthlyUsage(user);
  const plan = effectivePlan(user);
  const remainingFree = Math.max(0, FREE_ANALYSES_PER_MONTH - user.freeAnalysesUsed);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      plan,
      planStored: user.plan,
      premiumUntil: user.premiumUntil ?? null,
      credits: user.credits,
      usage: {
        month: user.usageMonth,
        freeAnalysesUsed: user.freeAnalysesUsed,
        freeAnalysesRemaining: plan === "premium" ? null : remainingFree,
        freeLimit: plan === "premium" ? null : FREE_ANALYSES_PER_MONTH,
      },
    },
  });
}
