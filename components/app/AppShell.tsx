"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAIN_NAV = [
  { href: "/app", label: "Dashboard", icon: "◆", desc: "Overview & history" },
  { href: "/app/new", label: "New analysis", icon: "+", desc: "Paste or screenshot" },
  { href: "/app/insights", label: "Patterns", icon: "◇", desc: "Your blind spots" },
] as const;

const SECONDARY_NAV = [
  { href: "/pricing", label: "Upgrade & pricing", icon: "₹", desc: "Razorpay checkout", accent: "warn" as const },
  { href: "/app/settings", label: "Setup & help", icon: "⚙", desc: "Keys & Atlas", accent: "muted" as const },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) {
        setEmail(data.user?.email ?? null);
        setPlan(data.user?.plan ?? null);
      }
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

  const activeHref = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#060609]/95 backdrop-blur-2xl transition-transform duration-300 ease-out lg:static lg:max-w-none lg:w-72 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-5">
          <Link href="/app" className="font-bold grad-text tracking-tight">
            Conv Replay
          </Link>
          <button type="button" className="btn btn-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 pb-6">
          <p className="px-4 pb-1 text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">Workspace</p>
          {MAIN_NAV.map((item) => {
            const active = activeHref(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col gap-0.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-white/[0.08] text-[var(--text)] shadow-[0_0_20px_rgba(196,92,255,0.08)] ring-1 ring-[var(--accent)]/25"
                    : "text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[var(--accent2)]">{item.icon}</span>
                  {item.label}
                </span>
                <span className="pl-8 text-[11px] font-normal text-[var(--muted)] opacity-80 group-hover:opacity-100">
                  {item.desc}
                </span>
              </Link>
            );
          })}

          <div className="divider my-4" />

          <p className="px-4 pb-1 text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">Grow</p>
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col gap-0.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeHref(item.href)
                  ? "bg-white/[0.08] text-[var(--text)] ring-1 ring-white/10"
                  : "text-[var(--muted)] hover:bg-white/[0.04] hover:text-[var(--text)]"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`font-mono ${item.accent === "warn" ? "text-[var(--warn)]" : "text-[var(--accent2)]"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
              <span className="pl-8 text-[11px] font-normal text-[var(--muted)]">{item.desc}</span>
            </Link>
          ))}

          <div className="divider my-4" />

          <p className="px-4 pb-1 text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">Explore</p>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted)] transition-all hover:bg-white/[0.04] hover:text-[var(--text)]"
          >
            <span className="font-mono text-[var(--accent)]">⌂</span>
            Marketing site
          </Link>

          {plan === "free" ? (
            <div className="mt-4 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/6 p-4 space-y-2">
              <p className="text-xs font-semibold text-[var(--text)]">Unlock unlimited</p>
              <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                1 free analysis / month included. Go Premium for 30 days of unlimited runs.
              </p>
              <Link href="/pricing" className="btn btn-primary btn-sm w-full text-center">
                Razorpay pricing →
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[var(--accent2)]/20 bg-[var(--accent2)]/5 px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent2)]">Premium active</p>
              <p className="text-xs text-[var(--muted)]">Unlimited analyses this cycle.</p>
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-white/[0.06] p-4 space-y-3">
          <div className="glass rounded-xl px-3 py-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">Signed in</p>
            <p className="truncate text-sm font-medium">{email ?? "…"}</p>
            {plan ? (
              <p className="mt-1 text-[10px] font-mono uppercase text-[var(--accent2)]">{plan}</p>
            ) : null}
          </div>
          <button type="button" className="btn w-full text-[var(--muted)]" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#050508]/90 px-4 backdrop-blur-xl lg:hidden">
          <button type="button" className="btn btn-sm" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <span className="truncate font-semibold grad-text text-sm">Conversation Replay</span>
        </header>

        <div className="relative flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
