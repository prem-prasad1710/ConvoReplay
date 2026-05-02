"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Parsing your conversation…",
  "Mapping speakers & emotional cues…",
  "Running deep intent analysis (Groq / Llama)…",
  "Drafting better replies & replay…",
  "Almost there — polishing your coach summary…",
] as const;

type Props = {
  open: boolean;
  startedAt?: number;
};

export function AnalysisLoadingOverlay({ open, startedAt }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase(0);
      return;
    }
    const t = setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, 4800);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 anim-analysis-overlay"
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#030308]/92 backdrop-blur-xl" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="analysis-orb analysis-orb-a" />
        <div className="analysis-orb analysis-orb-b" />
        <div className="analysis-grid-fade" />
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="analysis-pulse-ring" />
          <div className="analysis-core flex h-24 w-24 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent2)]/10 text-3xl shadow-[0_0_60px_rgba(196,92,255,0.35)]">
            ⚡
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent2)]">Analyzing</p>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-[#e8e4ff] to-[var(--accent2)] bg-clip-text text-transparent">
            Hold tight — your replay is worth the wait
          </h2>
          <p className="min-h-[3rem] text-sm leading-relaxed text-[var(--muted)] transition-all duration-500 anim-phase-text">
            {PHASES[phase]}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="analysis-progress-bar h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" />
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Typical run: 30–90s · Don&apos;t close this tab
            {startedAt ? ` · started ${new Date(startedAt).toLocaleTimeString()}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="rounded-full border border-white/10 px-3 py-1">Line-by-line breakdown</span>
          <span className="rounded-full border border-white/10 px-3 py-1">5 better replies</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Replay mode</span>
        </div>
      </div>
    </div>
  );
}
