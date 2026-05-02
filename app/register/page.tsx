"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not register.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Network error. Is MongoDB running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md anim-scale-in">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold grad-text">Conversation Replay</span>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Start for free</h1>
            <p className="text-[var(--muted)]">3 analyses/month · No credit card · 2 bonus credits</p>
          </div>

          <div className="glass-strong glow-border p-8 space-y-5">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--muted)]">Email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--muted)]">Password</label>
                  <span className="text-xs text-[var(--muted)]">min 8 characters</span>
                </div>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                {/* Password strength bar */}
                <div className="progress-bar mt-1">
                  <div
                    className="progress-fill"
                    style={{
                      width: password.length === 0
                        ? "0%"
                        : password.length < 8
                        ? "30%"
                        : password.length < 14
                        ? "65%"
                        : "100%",
                    }}
                  />
                </div>
              </div>

              {error ? (
                <div className="glass rounded-xl border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)] anim-fade-in flex items-start gap-2">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                style={{ padding: "0.8rem" }}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" /> Creating account…</>
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {["3 free/mo", "2 credits", "All features"].map((p) => (
                <div key={p} className="glass rounded-xl py-2 px-1">
                  <p className="text-xs text-[var(--accent2)] font-semibold">{p}</p>
                </div>
              ))}
            </div>

            <div className="divider" />

            <p className="text-center text-sm text-[var(--muted)]">
              Have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--accent2)] hover:text-[var(--accent)]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
