"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ConvRow = {
  _id: string;
  title?: string;
  status?: string;
  contextMode?: string;
  toneMode?: string;
  createdAt?: string;
};

type Me = {
  user: {
    email: string;
    plan: string;
    credits: number;
    usage: {
      freeAnalysesRemaining: number | null;
      freeAnalysesUsed: number | null;
      freeLimit: number | null;
    };
  };
};

type EnvStatus = {
  mongoConfigured: boolean;
  mongoDbName: string | null;
  groqConfigured: boolean;
  groqIssue: "missing" | "placeholder" | null;
  authSecretWeak: boolean;
};

const MISTAKE_LABELS: Record<string, string> = {
  desperation: "Desperation",
  over_explaining: "Over-explaining",
  weak_framing: "Weak framing",
  neediness: "Neediness",
  aggression: "Aggression",
  passive_behavior: "Passive behavior",
  miscommunication: "Miscommunication",
};

const statusIcon = (s?: string) => {
  if (s === "ready") return <span className="status-ready text-xs font-semibold">✓ Ready</span>;
  if (s === "processing") return <span className="status-processing text-xs font-semibold animate-pulse">⚡ Processing</span>;
  if (s === "failed") return <span className="status-failed text-xs font-semibold">✕ Failed</span>;
  return <span className="status-queued text-xs font-semibold">○ Queued</span>;
};

const ctxColors: Record<string, string> = {
  dating: "chip-active-red",
  interview: "chip-active-teal",
  workplace: "chip-active-purple",
  friendship: "chip-active-teal",
  conflict: "chip-active-orange",
  negotiation: "chip-active-purple",
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [list, setList] = useState<ConvRow[]>([]);
  const [patterns, setPatterns] = useState<{ key: string; count: number }[]>([]);
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mRes, cRes, pRes, sRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/conversations"),
          fetch("/api/insights/patterns"),
          fetch("/api/settings/status"),
        ]);
        if (!mRes.ok) {
          router.push("/login");
          return;
        }
        const mj = await mRes.json();
        const cj = await cRes.json();
        const pj = await pRes.json();
        const sj = sRes.ok ? await sRes.json() : null;
        if (cancelled) return;
        setMe(mj);
        setList(cj.conversations ?? []);
        setPatterns(pj.patterns ?? []);
        setEnvStatus(sj);
      } catch {
        if (!cancelled) setError("Could not load dashboard. Check your network.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const topPattern = patterns[0];
  const recentReady = list.filter((c) => c.status === "ready").length;

  return (
    <>
      <div className="bg-mesh pointer-events-none opacity-35" />
      <div className="bg-grid pointer-events-none opacity-50" />

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Title — sidebar handles primary nav */}
        <header className="anim-fade-in space-y-1">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">
            Overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {me ? (
            <p className="text-sm text-[var(--muted)]">
              Plan{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: me.user.plan === "premium" ? "var(--accent)" : "var(--muted)" }}
              >
                {me.user.plan}
              </span>
              {me.user.plan === "free" && (
                <>
                  {" "}
                  ·{" "}
                  <Link href="/pricing" className="text-[var(--accent2)] hover:underline">
                    Upgrade
                  </Link>
                </>
              )}
            </p>
          ) : (
            <p className="text-sm shine-text">Loading…</p>
          )}
        </header>

        {/* Env warnings */}
        {envStatus && (!envStatus.groqConfigured || envStatus.authSecretWeak || !envStatus.mongoConfigured) ? (
          <div className="space-y-3 anim-fade-in">
            {!envStatus.groqConfigured ? (
              <div className="glass rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/8 px-5 py-4 text-sm leading-relaxed">
                <p className="font-semibold text-[var(--danger)] mb-1">Groq API key not active</p>
                <p className="text-[var(--muted)]">
                  {envStatus.groqIssue === "placeholder"
                    ? "`.env.local` may override `.env` with a bad placeholder. Remove duplicate GROQ_API_KEY or set your real `gsk_` key, then restart the dev server."
                    : "Add GROQ_API_KEY to `.env` from console.groq.com/keys and restart `npm run dev`."}{" "}
                  <Link href="/app/settings" className="font-semibold text-[var(--accent2)] underline">
                    Setup guide →
                  </Link>
                </p>
              </div>
            ) : null}
            {envStatus.authSecretWeak ? (
              <div className="glass rounded-xl border border-[var(--warn)]/35 px-5 py-3 text-sm text-[var(--warn)]">
                AUTH_SECRET is short — use a longer random string (24+ chars) in `.env` for production.
              </div>
            ) : null}
            {!envStatus.mongoConfigured ? (
              <div className="glass rounded-xl border border-[var(--danger)]/35 px-5 py-3 text-sm text-[var(--danger)]">
                MONGODB_URI is missing — database calls will fail.
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="glass rounded-xl border border-[var(--danger)]/30 px-5 py-4 text-sm text-[var(--danger)] anim-fade-in">
            ⚠ {error}
          </div>
        ) : null}

        {/* Quick actions */}
        <section className="grid gap-3 sm:grid-cols-3 anim-fade-in delay-100">
          <Link
            href="/app/new"
            className="glass glass-hover glow-border flex flex-col gap-2 rounded-xl p-5 transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl">⚡</span>
            <p className="font-semibold">New analysis</p>
            <p className="text-xs text-[var(--muted)]">Paste text or screenshot — full breakdown</p>
          </Link>
          <Link
            href="/app/insights"
            className="glass glass-hover flex flex-col gap-2 rounded-xl p-5 transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl">📊</span>
            <p className="font-semibold">Patterns</p>
            <p className="text-xs text-[var(--muted)]">Recurring mistake signals over time</p>
          </Link>
          <Link
            href="/app/settings"
            className="glass glass-hover flex flex-col gap-2 rounded-xl p-5 transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl">⚙</span>
            <p className="font-semibold">Setup &amp; help</p>
            <p className="text-xs text-[var(--muted)]">API keys, MongoDB, troubleshooting</p>
          </Link>
        </section>

        {/* Stats row */}
        {me ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 anim-fade-in delay-100">
            <div className="glass p-5 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">Free left</p>
              <p className="text-3xl font-bold text-[var(--accent2)]">
                {me.user.plan === "premium"
                  ? "∞"
                  : `${me.user.usage?.freeAnalysesRemaining ?? 0}/${me.user.usage?.freeLimit ?? 3}`}
              </p>
              <p className="text-xs text-[var(--muted)]">this month</p>
            </div>
            <div className="glass p-5 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">Credits</p>
              <p className="text-3xl font-bold" style={{ color: "var(--warn)" }}>
                {me.user.credits}
              </p>
              <p className="text-xs text-[var(--muted)]">pay-per-use</p>
            </div>
            <div className="glass p-5 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">Total runs</p>
              <p className="text-3xl font-bold text-[var(--purple)]">{list.length}</p>
              <p className="text-xs text-[var(--muted)]">saved</p>
            </div>
            <div className="glass p-5 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">Completed</p>
              <p className="text-3xl font-bold text-[var(--accent2)]">{recentReady}</p>
              <p className="text-xs text-[var(--muted)]">ready</p>
            </div>
            <div className="glass p-5 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">Top pattern</p>
              <p className="text-lg font-bold leading-snug text-[var(--danger)]">
                {topPattern ? MISTAKE_LABELS[topPattern.key] ?? topPattern.key : "—"}
              </p>
              {topPattern ? (
                <p className="text-xs text-[var(--muted)]">×{topPattern.count}</p>
              ) : (
                <p className="text-xs text-[var(--muted)]">run analyses</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 anim-fade-in delay-100">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="glass h-24 animate-pulse rounded-xl" style={{ animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
        )}

        {/* Pattern chips */}
        {patterns.length > 0 ? (
          <div className="glass space-y-3 p-5 anim-fade-in delay-200">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
              Recurring patterns
            </p>
            <div className="flex flex-wrap gap-2">
              {patterns.slice(0, 10).map((p) => (
                <span key={p.key} className="chip chip-active-red gap-1.5">
                  {MISTAKE_LABELS[p.key] ?? p.key}
                  <span className="text-[10px] opacity-60">×{p.count}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Conversation list */}
        <section className="space-y-3 anim-fade-in delay-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted)]">
              Recent analyses
            </h2>
            {list.length > 0 && <span className="text-xs text-[var(--muted)]">{list.length} total</span>}
          </div>

          {list.length === 0 && me ? (
            <div className="glass glass-hover space-y-4 border border-dashed border-white/10 p-10 text-center">
              <p className="text-4xl">💬</p>
              <p className="text-lg font-semibold">No analyses yet</p>
              <p className="mx-auto max-w-sm text-sm text-[var(--muted)]">
                Paste a real conversation and get line-by-line coaching in under a minute.
              </p>
              <Link href="/app/new" className="btn btn-primary mx-auto">
                Analyze now →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.map((c, i) => (
                <li key={c._id} className="anim-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <Link
                    href={`/app/c/${c._id}`}
                    className="glass glass-hover group flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--text)] transition-colors group-hover:text-white">
                        {c.title ?? "Conversation"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {c.contextMode && (
                          <span
                            className={`chip ${ctxColors[c.contextMode] ?? "chip-active-teal"} py-0.5 text-[11px]`}
                          >
                            {c.contextMode}
                          </span>
                        )}
                        {c.toneMode && (
                          <span
                            className={`chip ${c.toneMode === "brutal" ? "chip-active-red" : "chip-active-teal"} py-0.5 text-[11px]`}
                          >
                            {c.toneMode}
                          </span>
                        )}
                        {c.createdAt && (
                          <span className="text-xs text-[var(--muted)]">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusIcon(c.status)}
                      <span className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--accent2)]">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {me && me.user.plan === "free" && (
          <div className="glass glow-border-teal flex flex-wrap items-center justify-between gap-4 rounded-xl p-5 anim-fade-in delay-400">
            <div>
              <p className="font-semibold">Upgrade to Premium</p>
              <p className="text-sm text-[var(--muted)]">Unlimited analyses — ₹99/mo</p>
            </div>
            <Link href="/pricing" className="btn btn-primary btn-sm">
              View plans
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
