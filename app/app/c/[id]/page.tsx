"use client";

import type { AnalysisResult, NormalizedTurn } from "@/lib/types/analysis";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ConvDoc = {
  _id: string;
  title?: string;
  status: string;
  contextMode?: string;
  toneMode?: string;
  normalizedTurns?: NormalizedTurn[];
  warnings?: string[];
  analysis?: AnalysisResult;
  errorMessage?: string;
  createdAt?: string;
};

type Tab = "breakdown" | "intent" | "power" | "replies" | "replay" | "playbook";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "breakdown", label: "Breakdown", icon: "🔍" },
  { key: "intent",    label: "Their intent", icon: "🧠" },
  { key: "power",     label: "Power", icon: "⚖️" },
  { key: "replies",   label: "Better replies", icon: "✍️" },
  { key: "replay",    label: "Replay", icon: "🎬" },
  { key: "playbook",  label: "Next time", icon: "📈" },
];

const MISTAKE_LABELS: Record<string, string> = {
  desperation: "Desperation",
  over_explaining: "Over-explaining",
  weak_framing: "Weak framing",
  neediness: "Neediness",
  aggression: "Aggression",
  passive_behavior: "Passive behavior",
  miscommunication: "Miscommunication",
};

function SeverityBar({ n }: { n: unknown }) {
  const level = clampSeverity(n);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-5 h-1.5 rounded-full"
          style={{
            background: i <= level ? `hsl(${340 - i * 20}, 90%, 65%)` : "rgba(255,255,255,0.08)",
          }}
        />
      ))}
      <span className={`text-xs font-semibold sev-${level}`}>{level}/5</span>
    </div>
  );
}

function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Groq JSON sometimes omits or mistypes severity — avoid NaN / crash in styles */
function clampSeverity(n: unknown): number {
  const x = Math.round(asNum(n, 3));
  const v = Number.isFinite(x) ? x : 3;
  return Math.min(5, Math.max(1, v));
}

function ConfidenceBar({ pct }: { pct: unknown }) {
  const p = typeof pct === "number" && Number.isFinite(pct) ? pct : asNum(pct, 0);
  const safe = Math.min(1, Math.max(0, p));
  const color = safe >= 0.7 ? "var(--accent2)" : safe >= 0.4 ? "var(--warn)" : "var(--muted)";
  return (
    <div className="flex items-center gap-2">
      <div className="progress-bar flex-1" style={{ maxWidth: 100 }}>
        <div className="progress-fill" style={{ width: `${safe * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{Math.round(safe * 100)}%</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn-sm ${copied ? "glow-border-teal" : ""}`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? (rawId[0] ?? "") : "";
  const [conv, setConv] = useState<ConvDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("breakdown");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (res.status === 401) { router.push("/login"); return; }
        if (!res.ok) { setError("Conversation not found."); return; }
        const data = await res.json();
        if (!cancelled) setConv(data.conversation);
      } catch {
        if (!cancelled) setError("Could not load conversation.");
      }
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id, router]);

  const mistakeByTurn = useMemo(() => {
    const m = new Map<number, NonNullable<AnalysisResult["stageOne"]["user_mistakes"]>[number]>();
    const list = Array.isArray(conv?.analysis?.stageOne?.user_mistakes)
      ? conv!.analysis!.stageOne.user_mistakes
      : [];
    list.forEach((u) => m.set(u.turn_index, u));
    return m;
  }, [conv]);

  const enrichedByTurn = useMemo(() => {
    const m = new Map<number, NonNullable<AnalysisResult["stageOne"]["turns_enriched"]>[number]>();
    const list = Array.isArray(conv?.analysis?.stageOne?.turns_enriched)
      ? conv!.analysis!.stageOne.turns_enriched
      : [];
    list.forEach((t) => m.set(t.i, t));
    return m;
  }, [conv]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass p-8 space-y-4 text-center">
          <p className="text-5xl">😕</p>
          <p className="text-lg font-semibold text-[var(--danger)]">{error}</p>
          <Link href="/app" className="btn btn-primary">← Dashboard</Link>
        </div>
      </main>
    );
  }

  if (!conv) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p className="text-[var(--muted)] text-sm">Loading analysis…</p>
        </div>
      </main>
    );
  }

  if (conv.status === "failed") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--accent2)]">← Dashboard</Link>
        <div className="glass p-8 space-y-3 border border-[var(--danger)]/25">
          <p className="text-3xl">⚠️</p>
          <h1 className="text-xl font-bold text-[var(--danger)]">Analysis failed</h1>
          <p className="text-[var(--muted)]">{conv.errorMessage ?? "Unknown error. Check GROQ_API_KEY and Groq console."}</p>
          <Link href="/app/new" className="btn btn-primary btn-sm">Try again</Link>
        </div>
      </main>
    );
  }

  if (conv.status !== "ready" || !conv.analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p className="text-[var(--muted)]">Still processing… refresh in a moment.</p>
      </main>
    );
  }

  const a = conv.analysis;
  const turns: NormalizedTurn[] = Array.isArray(conv.normalizedTurns) ? conv.normalizedTurns : [];
  const taxonomyHits = Array.isArray(a.stageOne?.taxonomy_hits) ? a.stageOne.taxonomy_hits : [];
  const intentRows = Array.isArray(a.stageOne?.their_likely_meaning) ? a.stageOne.their_likely_meaning : [];
  const replayTurns = Array.isArray(a.stageTwo?.replay_mode?.turns) ? a.stageTwo.replay_mode.turns : [];
  const futureLines = Array.isArray(a.stageTwo?.future_playbook) ? a.stageTwo.future_playbook : [];
  const pd = a.stageOne?.power_dynamics;

  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />

      <main className="relative mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header */}
        <header className="anim-fade-in space-y-3">
          <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--accent2)] transition-colors">
            ← Dashboard
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {conv.contextMode && (
                  <span className="chip chip-active-teal text-xs">{conv.contextMode}</span>
                )}
                {conv.toneMode && (
                  <span className={`chip ${conv.toneMode === "brutal" ? "chip-active-red" : "chip-active-teal"} text-xs`}>
                    {conv.toneMode === "brutal" ? "🔥 Brutal" : "🌿 Safe"}
                  </span>
                )}
                {conv.createdAt && (
                  <span className="text-xs text-[var(--muted)]">{new Date(conv.createdAt).toLocaleString()}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{conv.title}</h1>
            </div>
          </div>

          {(conv.warnings?.length ?? 0) > 0 && (
            <div className="glass rounded-xl border border-[var(--warn)]/30 px-4 py-3 text-sm text-[var(--warn)]">
              {conv.warnings?.map((w) => <p key={w}>⚠ {w}</p>)}
            </div>
          )}
        </header>

        {/* Coach summary */}
        <section className="glass glow-border p-6 space-y-3 anim-fade-in delay-100">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent2)] font-mono text-xs uppercase tracking-wider font-semibold">Coach summary</span>
            {conv.toneMode === "brutal" ? <span className="text-xs">🔥</span> : <span className="text-xs">🌿</span>}
          </div>
          <p className="leading-relaxed text-[var(--text)] text-[15px]">{a.stageTwo?.coach_summary ?? "—"}</p>
        </section>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-in delay-200">
          <div className="glass p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-[var(--danger)]">
              {Array.isArray(a.stageOne?.user_mistakes) ? a.stageOne.user_mistakes.length : 0}
            </p>
            <p className="text-xs text-[var(--muted)]">Mistakes found</p>
          </div>
          <div className="glass p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-[var(--accent2)]">{intentRows.length}</p>
            <p className="text-xs text-[var(--muted)]">Intent decoded</p>
          </div>
          <div className="glass p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-[var(--purple)]">{turns.length}</p>
            <p className="text-xs text-[var(--muted)]">Messages</p>
          </div>
          <div className="glass p-4 text-center space-y-1">
            <p className="text-2xl font-bold" style={{ color: "var(--warn)" }}>
              {Math.round((a.stageOne.speaker_map_confidence ?? 0) * 100)}%
            </p>
            <p className="text-xs text-[var(--muted)]">Speaker confidence</p>
          </div>
        </div>

        {/* Mistake type chips */}
        {taxonomyHits.length > 0 && (
          <div className="flex flex-wrap gap-2 anim-fade-in delay-200">
            {taxonomyHits.map((t) => (
              <span key={t} className={`chip mistake-${t}`}>
                {MISTAKE_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <nav className="glass p-1 flex flex-wrap gap-1 rounded-xl anim-fade-in delay-300">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`nav-pill flex-1 min-w-fit text-center text-xs ${tab === t.key ? "nav-pill-active" : ""}`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab panels */}
        <div className="anim-fade-in">
          {tab === "breakdown" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">Transcript</h2>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> You</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--accent2)]" /> Them</span>
                </div>
              </div>
              <ul className="space-y-2">
                {turns.map((t) => {
                  const mistake = mistakeByTurn.get(t.i);
                  const enriched = enrichedByTurn.get(t.i);
                  const cls = t.speaker === "me" ? "turn-me" : t.speaker === "other" ? "turn-other" : "turn-unknown";
                  return (
                    <li key={t.i} className={`glass rounded-xl px-5 py-4 ${cls} anim-fade-in`} style={{ animationDelay: `${t.i * 0.04}s` }}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs uppercase font-semibold ${t.speaker === "me" ? "text-[var(--accent)]" : t.speaker === "other" ? "text-[var(--accent2)]" : "text-[var(--muted)]"}`}>
                            {t.speaker} #{t.i}
                          </span>
                          {enriched?.emotion && (
                            <span className="chip text-[11px] py-0.5">{enriched.emotion}</span>
                          )}
                        </div>
                        {mistake && <SeverityBar n={mistake.severity} />}
                      </div>

                      <p className="text-sm leading-relaxed">{t.text}</p>

                      {mistake && (
                        <div className="mt-3 space-y-2 border-t border-white/6 pt-3">
                          <p className="text-sm text-[var(--muted)]">{mistake.line_explanation}</p>
                          <div className="flex flex-wrap gap-1">
                            {(mistake.types ?? []).map((ty) => (
                              <span key={ty} className={`chip mistake-${ty} text-xs`}>
                                {MISTAKE_LABELS[ty] ?? ty}
                              </span>
                            ))}
                          </div>
                          {mistake.evidence_quote && (
                            <blockquote className="text-xs italic text-[var(--muted)] border-l-2 border-white/10 pl-3">
                              &ldquo;{mistake.evidence_quote}&rdquo;
                            </blockquote>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {tab === "intent" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">What they likely meant</h2>
              {intentRows.length === 0 ? (
                <div className="glass p-8 text-center text-[var(--muted)] text-sm">No intent analysis available for this transcript.</div>
              ) : (
                <ul className="space-y-4">
                  {intentRows.map((row, i) => {
                    const signals = Array.isArray(row.signals) ? row.signals : [];
                    return (
                    <li key={i} className="glass rounded-xl p-5 space-y-3 anim-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-mono text-xs text-[var(--muted)]">Turn #{row.turn_index}</span>
                        <ConfidenceBar pct={row.confidence} />
                      </div>
                      <p className="font-medium leading-snug">{row.hypothesis ?? "—"}</p>
                      {signals.length > 0 && (
                        <ul className="space-y-1">
                          {signals.map((s) => (
                            <li key={s} className="text-sm text-[var(--muted)] flex items-start gap-2">
                              <span className="text-[var(--accent2)] mt-0.5">›</span> {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === "power" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">Power dynamics</h2>
              <div className="glass p-6">
                <p className="leading-relaxed">{pd?.summary ?? "—"}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass p-5 space-y-2 border border-[var(--accent)]/20">
                  <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">Your frame</p>
                  <p className="text-sm leading-relaxed">{pd?.user_frame ?? "—"}</p>
                </div>
                <div className="glass p-5 space-y-2 border border-[var(--accent2)]/20">
                  <p className="text-xs font-mono text-[var(--accent2)] uppercase tracking-wider font-semibold">Their frame</p>
                  <p className="text-sm leading-relaxed">{pd?.other_frame ?? "—"}</p>
                </div>
              </div>
              <div className="glass p-5 border border-[var(--warn)]/25 rounded-xl">
                <p className="text-xs font-mono text-[var(--warn)] uppercase tracking-wider font-semibold mb-2">Imbalance</p>
                <p className="text-sm leading-relaxed">{pd?.imbalance ?? "—"}</p>
              </div>
            </div>
          )}

          {tab === "replies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">5 Better replies</h2>
                <p className="text-xs text-[var(--muted)]">Targeting your pivotal mistake moment</p>
              </div>
              <div className="space-y-3">
                {([
                  { k: "confident",   label: "Confident",   icon: "💪", color: "var(--accent)" },
                  { k: "polite",      label: "Polite",      icon: "🤝", color: "var(--accent2)" },
                  { k: "assertive",   label: "Assertive",   icon: "⚡", color: "var(--warn)" },
                  { k: "high_status", label: "High-status", icon: "👑", color: "var(--purple)" },
                  { k: "minimal",     label: "Minimal",     icon: "🎯", color: "var(--blue)" },
                ] as const).map(({ k, label, icon, color }, i) => (
                  <div key={k} className="glass rounded-xl p-5 space-y-3 anim-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                          {label}
                        </p>
                      </div>
                      <CopyButton text={String(a.stageTwo?.better_replies?.[k] ?? "")} />
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text)]">
                      {a.stageTwo?.better_replies?.[k] ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "replay" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">Replay simulation</h2>
                <span className="chip text-[11px] py-0.5">Hypothetical</span>
              </div>
              <div className="glass rounded-xl p-4 text-xs text-[var(--muted)] border border-[var(--warn)]/20">
                ℹ {a.stageTwo?.replay_mode?.disclaimer ?? "—"}
              </div>
              <ul className="space-y-3">
                {replayTurns.map((t, i) => (
                  <li
                    key={i}
                    className={`max-w-2xl ${t.speaker === "me" ? "ml-auto" : ""} anim-fade-in`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <div className={`${t.speaker === "me" ? "bubble-me" : "bubble-other"} p-4 space-y-1`}>
                      <span className={`font-mono text-[10px] uppercase font-semibold ${t.speaker === "me" ? "text-[var(--accent)]" : "text-[var(--accent2)]"}`}>
                        {t.speaker}
                      </span>
                      <p className="text-sm leading-relaxed">{t.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "playbook" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wide">Future playbook</h2>
              <p className="text-sm text-[var(--muted)]">Three things to do differently in similar situations.</p>
              <ol className="space-y-4">
                {(futureLines).map((line, i) => (
                  <li key={i} className="glass rounded-xl p-5 flex gap-4 items-start anim-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, var(--accent), var(--accent2))` }}>
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed pt-1">{line}</p>
                  </li>
                ))}
              </ol>

              {/* Meta */}
              <div className="divider my-2" />
              <div className="flex flex-wrap items-center justify-between text-xs text-[var(--muted)] gap-4">
                <span>Model: <span className="font-mono">{a.model}</span></span>
                <span>Prompt: <span className="font-mono">{a.promptVersion}</span></span>
                {a.tokensUsed && <span>~{a.tokensUsed.toLocaleString()} tokens used</span>}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
