import { NextResponse } from "next/server";
import {
  getSessionUserDoc,
  unauthorized,
  badRequest,
  paymentRequired,
  serverError,
  misconfigured,
} from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";
import { canRunAnalysis, consumeQuota } from "@/lib/billing";
import { hashContent, normalizeTranscript } from "@/lib/transcript";
import { extractTextFromImageBase64, runAnalysisPipeline } from "@/lib/groq";
import { mergeMistakePatterns } from "@/lib/learning";
import { AnalysisCache } from "@/models/AnalysisCache";
import type { ContextMode, ToneMode, AnalysisResult } from "@/lib/types/analysis";
import { groqKeyUserMessage } from "@/lib/groq-config";
import { flattenErrorChain } from "@/lib/groq-fetch";
import { z } from "zod";
import mongoose from "mongoose";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    rawText: z.string().optional(),
    imageBase64: z.string().optional(),
    mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]).optional(),
    contextMode: z.enum([
      "dating",
      "interview",
      "workplace",
      "friendship",
      "conflict",
      "negotiation",
    ]),
    toneMode: z.enum(["brutal", "safe"]),
  })
  .refine((d) => {
    const hasText = typeof d.rawText === "string" && d.rawText.trim().length > 0;
    const hasImg = typeof d.imageBase64 === "string" && d.imageBase64.trim().length > 0;
    return hasText || hasImg;
  }, { message: "Provide pasted text or an image." });

export async function GET() {
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();
    await connectDb();
    const list = await Conversation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title status contextMode toneMode createdAt")
      .lean();
    return NextResponse.json({ conversations: list });
  } catch (e) {
    console.error(e);
    return serverError("Could not load conversations.");
  }
}

export async function POST(req: Request) {
  let convId: mongoose.Types.ObjectId | null = null;
  try {
    const user = await getSessionUserDoc();
    if (!user) return unauthorized();

    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
      return badRequest(msg);
    }

    const { rawText, imageBase64, mimeType, contextMode, toneMode } = parsed.data;

    const quota = canRunAnalysis(user);
    if (!quota.ok) {
      return paymentRequired();
    }

    await connectDb();

    let combined = rawText?.trim() ?? "";
    let ocrTokens = 0;

    if (imageBase64) {
      if (!mimeType) {
        return badRequest("mimeType is required when uploading an image.");
      }
      if (imageBase64.length > 12_000_000) {
        return badRequest("Image payload too large.", "PAYLOAD_TOO_LARGE");
      }
      const ocr = await extractTextFromImageBase64(mimeType, imageBase64);
      ocrTokens = ocr.tokens;
      if (!ocr.text || ocr.text.includes("ERROR_OCR")) {
        return badRequest("Could not read text from the screenshot.", "OCR_FAILED");
      }
      combined = combined ? `${combined}\n${ocr.text}` : ocr.text;
    }

    if (!combined.trim()) {
      return badRequest("No conversation text to analyze.");
    }

    const { turns, warnings } = normalizeTranscript(combined);
    const turnsJson = JSON.stringify(turns);
    const contentHash = hashContent([turnsJson, contextMode, toneMode]);

    const title =
      turns.find((t) => t.text)?.text?.slice(0, 72)?.trim() ?? "Conversation";

    const conv = await Conversation.create({
      userId: user._id,
      title,
      source: imageBase64 ? "upload" : "paste",
      rawInput: combined.slice(0, 120_000),
      contextMode: contextMode as ContextMode,
      toneMode: toneMode as ToneMode,
      status: "processing",
      normalizedTurns: turns,
      warnings,
      contentHash,
    });
    convId = conv._id;

    let analysis: AnalysisResult | null = null;
    let fromCache = false;

    const cachedDoc = await AnalysisCache.findOne({
      contentHash,
      contextMode,
      toneMode,
    }).lean();

    const cached = cachedDoc as { analysis?: AnalysisResult } | null;

    if (cached?.analysis) {
      analysis = cached.analysis as AnalysisResult;
      fromCache = true;
    } else {
      analysis = await runAnalysisPipeline({
        contextMode: contextMode as ContextMode,
        toneMode: toneMode as ToneMode,
        turnsJson,
      });

      const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await AnalysisCache.findOneAndUpdate(
        { contentHash, contextMode, toneMode },
        { contentHash, contextMode, toneMode, analysis, expiresAt: expiry },
        { upsert: true }
      );
    }

    if (!analysis) {
      throw new Error("Analysis missing");
    }

    mergeMistakePatterns(user, analysis.stageOne);
    consumeQuota(user, quota);

    const tokenExtra = fromCache ? ocrTokens : (analysis.tokensUsed ?? 0) + ocrTokens;

    await User.findByIdAndUpdate(user._id, {
      mistakePatterns: user.mistakePatterns,
      credits: user.credits,
      freeAnalysesUsed: user.freeAnalysesUsed,
      usageMonth: user.usageMonth,
    });

    await Conversation.findByIdAndUpdate(conv._id, {
      status: "ready",
      analysis,
      tokensUsed: tokenExtra || undefined,
    });

    return NextResponse.json({
      id: conv.id,
      status: "ready",
      cached: fromCache,
      warnings,
    });
  } catch (e) {
    console.error(e);
    const mapped = mapGroqFailure(e);
    const errorLine =
      mapped?.userMessage ?? (e instanceof Error ? e.message : "Analysis failed.");

    if (convId) {
      await connectDb();
      await Conversation.findByIdAndUpdate(convId, {
        status: "failed",
        errorMessage: errorLine,
      });
    }

    if (mapped) return mapped.response;

    return serverError(
      e instanceof Error ? e.message : "Analysis failed. Check GROQ_API_KEY and console.groq.com."
    );
  }
}

function mapGroqFailure(e: unknown): {
  response: NextResponse;
  userMessage: string;
} | null {
  const msg = e instanceof Error ? e.message : String(e);
  const chain = flattenErrorChain(e).toLowerCase();

  if (msg === "GROQ_KEY_MISSING") {
    const userMessage = groqKeyUserMessage("missing");
    return { response: misconfigured(userMessage), userMessage };
  }
  if (msg === "GROQ_KEY_PLACEHOLDER") {
    const userMessage = groqKeyUserMessage("placeholder");
    return { response: misconfigured(userMessage), userMessage };
  }

  if (
    chain.includes("unable to get local issuer certificate") ||
    chain.includes("unable_to_get_issuer_cert_locally") ||
    chain.includes("cert_authority_invalid") ||
    chain.includes("self signed certificate") ||
    chain.includes("ssl3_read_bytes")
  ) {
    const userMessage =
      "TLS certificate verification failed when calling Groq (common on corporate VPNs or SSL-inspecting antivirus). " +
      "Try: (1) Set NODE_EXTRA_CA_CERTS=/path/to/your-root-CA.pem if your employer provides one. " +
      "(2) Dev-only: add GROQ_TLS_INSECURE=1 to `.env` and restart `npm run dev` — never use that in production. " +
      "See Setup & help in the app.";
    return { response: misconfigured(userMessage), userMessage };
  }

  const err = e as { status?: number; message?: string };
  const detail = typeof err.message === "string" ? err.message : msg;
  if (
    err.status === 401 ||
    err.status === 403 ||
    detail.toLowerCase().includes("invalid api key") ||
    detail.includes("Incorrect API key") ||
    detail.includes("invalid_api_key") ||
    detail.includes("Incorrect API key provided")
  ) {
    const userMessage =
      "Groq rejected your API key. Create a key at console.groq.com/keys, set GROQ_API_KEY in `.env`, remove any duplicate from `.env.local`, then restart `npm run dev`.";
    return { response: misconfigured(userMessage), userMessage };
  }

  return null;
}
