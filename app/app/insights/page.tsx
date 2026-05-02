"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Pattern = { key: string; count: number };

const LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  desperation: { label: "Desperation", icon: "😰", color: "#ff6b7a", desc: "Coming from a place of need, chasing, over-investing." },
  over_explaining: { label: "Over-explaining", icon: "📝", color: "#ffb347", desc: "Justifying yourself when no justification was asked for." },
  weak_framing: { label: "Weak framing", icon: "🪞", color: "#ffc857", desc: "Presenting yourself or the situation with low confidence." },
  neediness: { label: "Neediness", icon: "🪝", color: "#ff8c42", desc: "Seeking validation, reassurance, or approval from the other person." },
  aggression: { label: "Aggression", icon: "💢", color: "#ff5050", desc: "Escalating or attacking — even subtly — instead of addressing." },
  passive_behavior: { label: "Passive behavior", icon: "🫥", color: "#8b87a8", desc: "Avoiding direct communication or action when directness was needed." },
  miscommunication: { label: "Miscommunication", icon: "📡", color: "#4f9fff", desc: "Intent not landing — vague, ambiguous, or misread messages." },
};

export default function InsightsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/insights/patterns");
        if (!res.ok) { setError("Sign in to view patterns."); setLoading(false); return; }
        const data = await res.json();
        if (!cancelled) {
          setPatterns(data.patterns ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setError("Could not load patterns."); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const max = patterns[0]?.count ?? 1;

  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <div className="orb orb-2" style={{ opacity: 0.4 }} />

      <main className="relative mx-auto max-w-3xl min-h-screen px-6 py-10 space-y-8">
        <header className="anim-fade-in space-y-2">
          <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--accent2)] transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Learning patterns</h1>
          <p className="text-[var(--muted)] text-sm max-w-lg">
            Recurring signals aggregated across all your analyses. Use this to understand your
            communication blind spots — not to judge yourself.
          </p>
        </header>

        {error ? (
          <div className="glass rounded-xl border border-[var(--warn)]/30 px-5 py-4 text-sm text-[var(--warn)] anim-fade-in">
            ⚠ {error}
          </div>
        ) : null}

        {loading && (
          <div className="space-y-3">
            {[0,1,2,3].map((i) => (
              <div key={i} className="glass h-20 animate-pulse rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {!loading && patterns.length === 0 && !error && (
          <div className="glass p-10 text-center space-y-4 anim-fade-in">
            <p className="text-4xl">📊</p>
            <p className="font-semibold text-lg">No patterns yet</p>
            <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
              Run a few analyses with clear speaker labels (Me: / Name:) to start tracking your patterns over time.
            </p>
            <Link href="/app/new" className="btn btn-primary mx-auto">
              Analyze a conversation →
            </Link>
          </div>
        )}

        {patterns.length > 0 && (
          <div className="space-y-3">
            {patterns.map((p, i) => {
              const meta = LABELS[p.key];
              const pct = p.count / max;
              const color = meta?.color ?? "var(--accent2)";
              return (
                <div
                  key={p.key}
                  className="glass rounded-xl p-5 space-y-3 anim-fade-in"
                  style={{ animationDelay: `${i * 0.06}s`, borderColor: `${color}22` }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta?.icon ?? "🔴"}</span>
                      <div>
                        <p className="font-semibold">{meta?.label ?? p.key}</p>
                        <p className="text-xs text-[var(--muted)]">{meta?.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color }}>{p.count}</p>
                      <p className="text-xs text-[var(--muted)]">occurrences</p>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct * 100}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}99)`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {patterns.length > 0 && (
          <div className="glass glow-border-teal p-5 space-y-2 anim-fade-in">
            <p className="font-semibold text-sm">What to work on</p>
            <p className="text-sm text-[var(--muted)]">
              Your top pattern is{" "}
              <span className="font-semibold" style={{ color: LABELS[patterns[0]?.key]?.color }}>
                {LABELS[patterns[0]?.key]?.label ?? patterns[0]?.key}
              </span>
              . Next time you write a message, pause and ask:{" "}
              <em>am I doing this from a secure place, or am I reacting?</em>
            </p>
          </div>
        )}

        {/* All 7 types reference */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">All tracked types</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LABELS).map(([key, meta]) => {
              const found = patterns.find((p) => p.key === key);
              return (
                <div
                  key={key}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                  style={{ opacity: found ? 1 : 0.45 }}
                >
                  <span>{meta.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{meta.label}</p>
                    {found ? (
                      <p className="text-xs font-bold" style={{ color: meta.color }}>×{found.count}</p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">not detected yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
