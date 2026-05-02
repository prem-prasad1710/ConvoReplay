/**
 * Groq API keys typically start with `gsk_`.
 * https://console.groq.com/keys
 */
export function isPlaceholderGroqKey(key: string): boolean {
  const k = key.trim().toLowerCase();
  if (!k) return true;
  if (!k.startsWith("gsk_")) return true;
  if (k.includes("replace")) return true;
  if (k.includes("your_key")) return true;
  if (k.includes("placeholder")) return true;
  if (k.includes("paste_your")) return true;
  return false;
}

export type GroqKeyIssue = "missing" | "placeholder";

export function resolveGroqApiKey(): { ok: true; key: string } | { ok: false; issue: GroqKeyIssue } {
  const raw = process.env.GROQ_API_KEY;
  const key = typeof raw === "string" ? raw.trim() : "";
  if (!key) return { ok: false, issue: "missing" };
  if (isPlaceholderGroqKey(key)) return { ok: false, issue: "placeholder" };
  return { ok: true, key };
}

export function groqKeyUserMessage(issue: GroqKeyIssue): string {
  if (issue === "missing") {
    return "GROQ_API_KEY is not set. Add it to `.env` (see console.groq.com/keys) and restart `npm run dev`.";
  }
  return (
    "GROQ_API_KEY looks invalid or like a placeholder. " +
    "Use a real key starting with `gsk_`. If your key is in `.env` but `.env.local` also defines GROQ_API_KEY, remove the duplicate — Next.js prioritizes `.env.local`."
  );
}
