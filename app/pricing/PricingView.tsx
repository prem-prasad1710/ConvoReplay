"use client";

import Link from "next/link";
import { PremiumCheckoutButton } from "@/components/PremiumCheckoutButton";

export default function PricingView() {
  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className="relative mx-auto max-w-4xl min-h-screen px-6 py-16 space-y-16">
        <nav className="flex items-center justify-between anim-fade-in">
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">
            ← Home
          </Link>
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-sm">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </nav>

        <header className="text-center space-y-4 anim-fade-in delay-100">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold">Simple. Honest.</h1>
          <p className="text-[var(--muted)] max-w-lg mx-auto">
            One free full analysis per month on us. Unlock unlimited depth when you&apos;re ready — powered by{" "}
            <strong className="text-[var(--text)]">Razorpay</strong>.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 anim-fade-in delay-200">
          <div className="glass glass-hover p-8 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] mb-2">Free</p>
              <p className="text-5xl font-bold">₹0</p>
              <p className="text-[var(--muted)] text-sm mt-1">Try the full pipeline once every month</p>
            </div>
            <ul className="space-y-3">
              {[
                "1 full analysis / month (resets monthly)",
                "All 6 context modes · Brutal + safe tone",
                "Line-by-line breakdown · 5 replies · Replay",
                "Pattern tracking across runs",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--accent2)]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn w-full text-center">
              Start free →
            </Link>
          </div>

          <div className="glass glass-hover glow-border p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="chip chip-active-purple text-[11px]">Popular</span>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] mb-2">Premium</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold grad-text">₹99</p>
                <p className="text-[var(--muted)] text-sm mb-1">/ 30 days</p>
              </div>
              <p className="text-[var(--muted)] text-sm mt-1">
                Unlimited analyses · Secure checkout via Razorpay (cards, UPI, wallets)
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Unlimited analyses for 30 days after payment",
                "Everything in Free",
                "Priority routing",
                "Renew anytime from this page while signed in",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--accent)]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Sign in first. Uses Razorpay Checkout — your card details never touch our servers.
            </p>
            <PremiumCheckoutButton />
          </div>
        </div>

        <div className="glass p-7 space-y-4 anim-fade-in delay-300 text-center md:text-left">
          <p className="font-semibold text-lg">Need help?</p>
          <p className="text-sm text-[var(--muted)]">
            Configure <code className="font-mono text-xs">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>,{" "}
            <code className="font-mono text-xs">RAZORPAY_KEY_ID</code>,{" "}
            <code className="font-mono text-xs">RAZORPAY_KEY_SECRET</code> on Vercel. Amount (paise):{" "}
            <code className="font-mono text-xs">RAZORPAY_PREMIUM_AMOUNT_PAISE=9900</code> for ₹99.
          </p>
          <Link href="/app/settings" className="btn btn-sm inline-flex">
            Setup &amp; troubleshooting →
          </Link>
        </div>
      </main>
    </>
  );
}
