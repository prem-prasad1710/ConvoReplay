import type { UserDoc } from "@/models/User";

export const FREE_ANALYSES_PER_MONTH = 1;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type QuotaResult =
  | { ok: true; usedCredit: boolean }
  | { ok: false; reason: "no_quota" };

/** Premium access from Razorpay; expired subscriptions behave as free for quotas. */
export function effectivePlan(user: UserDoc): "free" | "premium" {
  if (user.plan !== "premium") return "free";
  const until = user.premiumUntil as Date | undefined | null;
  if (until == null) return "premium";
  const end = until instanceof Date ? until : new Date(String(until));
  return end.getTime() > Date.now() ? "premium" : "free";
}

export function refreshMonthlyUsage(user: UserDoc): void {
  const m = currentMonth();
  if (user.usageMonth !== m) {
    user.usageMonth = m;
    user.freeAnalysesUsed = 0;
  }
}

export function canRunAnalysis(user: UserDoc): QuotaResult {
  refreshMonthlyUsage(user);
  if (effectivePlan(user) === "premium") {
    return { ok: true, usedCredit: false };
  }
  if (user.freeAnalysesUsed < FREE_ANALYSES_PER_MONTH) {
    return { ok: true, usedCredit: false };
  }
  if (user.credits > 0) {
    return { ok: true, usedCredit: true };
  }
  return { ok: false, reason: "no_quota" };
}

export function consumeQuota(user: UserDoc, q: QuotaResult): void {
  if (!q.ok) return;
  if (effectivePlan(user) === "premium") return;
  if (q.usedCredit) {
    user.credits -= 1;
    return;
  }
  user.freeAnalysesUsed += 1;
}
