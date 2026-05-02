import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: { code: "VALIDATION", message: msg } }, { status: 400 });
    }
    await connectDb();
    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: { code: "EMAIL_IN_USE", message: "That email is already registered." } },
        { status: 409 }
      );
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      credits: 0,
    });

    const token = await signSession({ sub: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not register." } },
      { status: 500 }
    );
  }
}
