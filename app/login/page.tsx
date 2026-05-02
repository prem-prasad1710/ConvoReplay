"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not sign in.");
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
            <h1 className="text-3xl font-bold mt-4">Welcome back</h1>
            <p className="text-[var(--muted)]">Sign in to your coaching dashboard</p>
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
                <label className="text-sm font-medium text-[var(--muted)]">Password</label>
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="glass rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-3 text-sm text-[var(--danger)] anim-fade-in flex items-start gap-2">
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
                  <><span className="spinner" /> Signing in…</>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <div className="divider" />

            <p className="text-center text-sm text-[var(--muted)]">
              No account?{" "}
              <Link href="/register" className="font-semibold text-[var(--accent2)] hover:text-[var(--accent)]">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
