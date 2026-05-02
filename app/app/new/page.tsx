"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const CONTEXTS = [
  { key: "dating",      label: "Dating",       icon: "💘", color: "chip-active-red" },
  { key: "interview",   label: "Interview",    icon: "💼", color: "chip-active-teal" },
  { key: "workplace",   label: "Workplace",    icon: "🏢", color: "chip-active-purple" },
  { key: "friendship",  label: "Friendship",   icon: "🤝", color: "chip-active-teal" },
  { key: "conflict",    label: "Conflict",     icon: "⚡", color: "chip-active-orange" },
  { key: "negotiation", label: "Negotiation",  icon: "🤝", color: "chip-active-purple" },
] as const;

type ContextKey = (typeof CONTEXTS)[number]["key"];

export default function NewAnalysisPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rawText, setRawText] = useState("");
  const [contextMode, setContextMode] = useState<ContextKey>("dating");
  const [toneMode, setToneMode] = useState<"brutal" | "safe">("brutal");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!rawText.trim() && !file) {
      setError("Paste conversation text or attach a screenshot to begin.");
      return;
    }

    setLoading(true);
    setProgress("Preparing transcript…");

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        if (file.size > 4 * 1024 * 1024) {
          setError("Image must be under 4MB.");
          setLoading(false);
          setProgress(null);
          return;
        }
        if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
          setError("Use PNG, JPG, WebP, or GIF.");
          setLoading(false);
          setProgress(null);
          return;
        }
        mimeType = file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif";
        setProgress("Reading image (Vision OCR)…");
        imageBase64 = await readFileBase64(file);
      }

      setProgress("Running 2-stage analysis on Groq (Llama)… ~30–60s");

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawText.trim() || undefined,
          imageBase64,
          mimeType,
          contextMode,
          toneMode,
        }),
      });

      const data = await res.json();
      if (res.status === 402) {
        setError(data?.error?.message ?? "Monthly free analyses used. Add credits or upgrade.");
        return;
      }
      if (res.status === 503 || data?.error?.code === "MISCONFIGURED") {
        setError(data?.error?.message ?? "Configuration issue. Open Setup & help in the sidebar.");
        return;
      }
      if (!res.ok) {
        setError(data?.error?.message ?? "Analysis failed.");
        return;
      }

      router.push(`/app/c/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <div className="orb orb-1" style={{ opacity: 0.4 }} />
      <div className="orb orb-3" style={{ opacity: 0.4 }} />

      <main className="relative mx-auto max-w-3xl min-h-screen px-6 py-10 space-y-8">
        <header className="anim-fade-in space-y-1">
          <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--accent2)] transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">New analysis</h1>
          <p className="text-sm text-[var(--muted)]">
            Label speakers when you can:{" "}
            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">Me: …</span>{" "}
            /{" "}
            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">Alex: …</span>
            . Or drop a screenshot — we OCR it.
          </p>
        </header>

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Step 1: Context */}
          <div className="glass p-6 space-y-4 anim-fade-in delay-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full glass flex items-center justify-center text-xs font-bold text-[var(--accent2)]">1</span>
              <h2 className="font-semibold">Context mode</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTEXTS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setContextMode(c.key)}
                  className={`chip ${contextMode === c.key ? c.color : ""}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)]">
              Calibrates how mistakes, intent, and power are interpreted.
            </p>
          </div>

          {/* Step 2: Tone */}
          <div className="glass p-6 space-y-4 anim-fade-in delay-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full glass flex items-center justify-center text-xs font-bold text-[var(--accent2)]">2</span>
              <h2 className="font-semibold">Coach tone</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setToneMode("brutal")}
                className={`glass p-4 text-left space-y-1 transition-all rounded-xl border ${
                  toneMode === "brutal"
                    ? "border-[var(--danger)]/50 bg-[var(--danger)]/8 shadow-[0_0_20px_rgba(255,107,122,0.1)]"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <p className="text-base">🔥</p>
                <p className="font-semibold text-sm">Brutal Truth</p>
                <p className="text-xs text-[var(--muted)]">Blunt. Direct. No sugarcoating.</p>
              </button>
              <button
                type="button"
                onClick={() => setToneMode("safe")}
                className={`glass p-4 text-left space-y-1 transition-all rounded-xl border ${
                  toneMode === "safe"
                    ? "border-[var(--accent2)]/50 bg-[var(--accent2)]/6 shadow-[0_0_20px_rgba(92,240,216,0.1)]"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <p className="text-base">🌿</p>
                <p className="font-semibold text-sm">Safe Mode</p>
                <p className="text-xs text-[var(--muted)]">Supportive framing. Same insight.</p>
              </button>
            </div>
          </div>

          {/* Step 3: Transcript */}
          <div className="glass p-6 space-y-4 anim-fade-in delay-300">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full glass flex items-center justify-center text-xs font-bold text-[var(--accent2)]">3</span>
              <h2 className="font-semibold">Conversation text</h2>
            </div>
            <textarea
              className="input font-mono text-sm"
              placeholder={`Me: hey are we still on for tonight?\nAlex: idk maybe super tired\nMe: okay no worries! totally understand :)`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <p className="text-xs text-[var(--muted)]">
              {rawText.length > 0 ? `${rawText.length} chars · ~${Math.ceil(rawText.split(/\s+/).length)} words` : "Tip: paste the full chat for deeper analysis"}
            </p>
          </div>

          {/* Step 4: Screenshot */}
          <div className="glass p-6 space-y-4 anim-fade-in delay-400">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full glass flex items-center justify-center text-xs font-bold text-[var(--accent2)]">4</span>
              <h2 className="font-semibold">Screenshot <span className="text-[var(--muted)] font-normal text-xs">(optional — Vision OCR)</span></h2>
            </div>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-[var(--accent)] bg-[var(--accent)]/8"
                  : file
                  ? "border-[var(--accent2)]/50 bg-[var(--accent2)]/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="space-y-1">
                  <p className="text-[var(--accent2)] font-semibold">✓ {file.name}</p>
                  <p className="text-xs text-[var(--muted)]">{(file.size / 1024).toFixed(0)}KB · click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-3xl">📸</p>
                  <p className="font-medium">Drop screenshot here or click</p>
                  <p className="text-xs text-[var(--muted)]">PNG, JPG, WebP, GIF · max 4MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error ? (
            <div className="glass rounded-xl border border-[var(--danger)]/30 px-5 py-4 text-sm text-[var(--danger)] anim-fade-in flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          ) : null}

          {/* Submit */}
          <div className="flex flex-col gap-3 anim-fade-in delay-500">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
              style={{ animationName: loading ? "pulse-glow" : "none", animationDuration: "2s", animationIterationCount: "infinite" }}
            >
              {loading ? (
                <><span className="spinner" /> {progress ?? "Analyzing…"}</>
              ) : (
                "Run analysis →"
              )}
            </button>
            {loading && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: "60%", transition: "width 30s linear" }}
                />
              </div>
            )}
            <p className="text-xs text-center text-[var(--muted)]">
              Takes 20–60 seconds · Uses 1 free analysis or 1 credit
            </p>
          </div>
        </form>
      </main>
    </>
  );
}

function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") { reject(new Error("read failed")); return; }
      const parts = res.split(",");
      resolve(parts[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
