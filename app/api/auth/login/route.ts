import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Invalid credentials." } },
        { status: 400 }
      );
    }
    await connectDb();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json(
        { error: { code: "INVALID_LOGIN", message: "Wrong email or password." } },
        { status: 401 }
      );
    }

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
      { error: { code: "SERVER_ERROR", message: "Could not sign in." } },
      { status: 500 }
    );
  }
}
