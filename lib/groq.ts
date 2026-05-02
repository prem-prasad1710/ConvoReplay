import OpenAI from "openai";
import { groqCompatibleFetch } from "@/lib/groq-fetch";
import { resolveGroqApiKey } from "@/lib/groq-config";
import type {
  ContextMode,
  ToneMode,
  StageOneResult,
  StageTwoResult,
  AnalysisResult,
} from "@/lib/types/analysis";
import {
  PROMPT_VERSION,
  baseSystemInstruction,
  buildStageOneUserMessage,
  buildStageTwoUserMessage,
} from "@/lib/prompts";

/** Groq OpenAI-compatible endpoint */
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/** Strong JSON + reasoning for analysis */
const DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile";
/** Vision / screenshot OCR — multimodal on Groq */
const DEFAULT_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

function getGroqClient() {
  const resolved = resolveGroqApiKey();
  if (!resolved.ok) {
    throw new Error(`GROQ_KEY_${resolved.issue.toUpperCase()}`);
  }
  return new OpenAI({
    apiKey: resolved.key,
    baseURL: GROQ_BASE_URL,
    fetch: groqCompatibleFetch,
  });
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(cleaned) as T;
}

function textModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_TEXT_MODEL;
}

function visionModel(): string {
  return process.env.GROQ_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL;
}

export async function extractTextFromImageBase64(
  mimeType: string,
  base64: string
): Promise<{ text: string; tokens: number }> {
  const client = getGroqClient();
  const model = visionModel();

  const res = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You extract chat/conversation text from screenshots. Preserve order and speaker labels if visible. Output plain lines only, one message per line. If unreadable, output exactly: ERROR_OCR",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the conversation text from this image. Keep names/labels as shown.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim() ?? "";
  const tokens = res.usage?.total_tokens ?? 0;
  return { text, tokens };
}

export async function runAnalysisPipeline(params: {
  contextMode: ContextMode;
  toneMode: ToneMode;
  turnsJson: string;
}): Promise<AnalysisResult> {
  const client = getGroqClient();
  const model = textModel();
  const sys = baseSystemInstruction(params.toneMode);

  const stageOneMessages = [
    { role: "system" as const, content: sys },
    {
      role: "user" as const,
      content: buildStageOneUserMessage(params.contextMode, params.turnsJson),
    },
  ];

  let one;
  try {
    one = await client.chat.completions.create({
      model,
      temperature: 0.25,
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: stageOneMessages,
    });
  } catch {
    one = await client.chat.completions.create({
      model,
      temperature: 0.25,
      max_tokens: 8192,
      messages: stageOneMessages,
    });
  }

  const rawOne = one.choices[0]?.message?.content ?? "{}";
  const stageOne = parseJson<StageOneResult>(rawOne);
  const tokensOne = one.usage?.total_tokens ?? 0;

  const stageTwoMessages = [
    { role: "system" as const, content: sys },
    {
      role: "user" as const,
      content: buildStageTwoUserMessage(params.contextMode, stageOne, params.turnsJson),
    },
  ];

  let two;
  try {
    two = await client.chat.completions.create({
      model,
      temperature: params.toneMode === "brutal" ? 0.55 : 0.45,
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: stageTwoMessages,
    });
  } catch {
    two = await client.chat.completions.create({
      model,
      temperature: params.toneMode === "brutal" ? 0.55 : 0.45,
      max_tokens: 8192,
      messages: stageTwoMessages,
    });
  }

  const rawTwo = two.choices[0]?.message?.content ?? "{}";
  const stageTwo = parseJson<StageTwoResult>(rawTwo);
  const tokensTwo = two.usage?.total_tokens ?? 0;

  const label = `${model} (Groq)`;

  return {
    stageOne,
    stageTwo,
    model: label,
    promptVersion: PROMPT_VERSION,
    tokensUsed: tokensOne + tokensTwo,
  };
}
