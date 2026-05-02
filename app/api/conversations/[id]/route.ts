import { NextResponse } from "next/server";
import {
  getSessionUserDoc,
  unauthorized,
  serverError,
} from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Invalid id." } }, { status: 404 });
    }

    await connectDb();
    const conv = await Conversation.findOne({ _id: id, userId: user._id }).lean();
    if (!conv) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found." } }, { status: 404 });
    }

    return NextResponse.json({ conversation: conv });
  } catch (e) {
    console.error(e);
    return serverError("Could not load conversation.");
  }
}
