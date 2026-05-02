import { NextResponse } from "next/server";
import { getSessionUserDoc, unauthorized, serverError } from "@/lib/api-helpers";
import { refreshMonthlyUsage } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    refreshMonthlyUsage(user);

    const patterns = user.mistakePatterns;
    const entries =
      patterns && typeof patterns === "object" && !Array.isArray(patterns)
        ? Object.entries(patterns as Record<string, number>).sort((a, b) => b[1] - a[1])
        : [];

    return NextResponse.json({
      patterns: entries.map(([key, count]) => ({ key, count })),
    });
  } catch (e) {
    console.error(e);
    return serverError("Could not load patterns.");
  }
}
