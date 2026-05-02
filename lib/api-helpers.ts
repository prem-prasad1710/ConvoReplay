import { getSession } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { User, type UserDoc } from "@/models/User";
import { NextResponse } from "next/server";

export async function getSessionUserDoc(): Promise<UserDoc | null> {
  const session = await getSession();
  if (!session?.sub) return null;
  await connectDb();
  const user = await User.findById(session.sub);
  return user ?? null;
}

export function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Sign in required." } },
    { status: 401 }
  );
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return NextResponse.json({ error: { code, message } }, { status: 400 });
}

export function paymentRequired(message = "Monthly free analyses used. Upgrade or add credits.") {
  return NextResponse.json(
    { error: { code: "INSUFFICIENT_CREDITS", message } },
    { status: 402 }
  );
}

export function serverError(message: string) {
  return NextResponse.json({ error: { code: "SERVER_ERROR", message } }, { status: 500 });
}

/** Missing env / invalid keys — client should show setup instructions */
export function misconfigured(message: string) {
  return NextResponse.json({ error: { code: "MISCONFIGURED", message } }, { status: 503 });
}
