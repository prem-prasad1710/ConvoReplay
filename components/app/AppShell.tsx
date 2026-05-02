"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "◆" },
  { href: "/app/new", label: "New analysis", icon: "+" },
  { href: "/app/insights", label: "Patterns", icon: "◇" },
  { href: "/app/settings", label: "Setup & help", icon: "⚙" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) setEmail(data.user?.email ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-[#060609]/90 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/[0.06] px-5">
          <Link href="/app" className="font-bold grad-text tracking-tight">
            Conv Replay
          </Link>
          <button
            type="button"
            className="btn btn-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-white/[0.08] text-[var(--text)] shadow-[0_0_20px_rgba(196,92,255,0.08)] ring-1 ring-[var(--accent)]/25"
                    : "text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                }`}
              >
                <span className="font-mono text-[var(--accent2)]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <div className="divider my-4" />

          <p className="px-4 pt-2 text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
            External
          </p>
          <Link
            href="/pricing"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
          >
            <span className="font-mono text-[var(--warn)]">₹</span>
            Pricing
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
          >
            <span className="font-mono text-[var(--accent)]">⌂</span>
            Landing page
          </Link>
        </nav>

        <div className="border-t border-white/[0.06] p-4 space-y-3">
          <div className="glass rounded-xl px-3 py-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Signed in
            </p>
            <p className="truncate text-sm font-medium">{email ?? "…"}</p>
          </div>
          <button type="button" className="btn w-full text-[var(--muted)]" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#050508]/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-semibold grad-text text-sm">Conversation Replay</span>
        </header>

        <div className="relative flex-1">{children}</div>
      </div>
    </div>
  );
}
