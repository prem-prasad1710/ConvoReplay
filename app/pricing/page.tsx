import Link from "next/link";

export default function PricingPage() {
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
          <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
        </nav>

        <header className="text-center space-y-4 anim-fade-in delay-100">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold">Simple. Honest.</h1>
          <p className="text-[var(--muted)] max-w-lg mx-auto">
            Free enough to fall in love. Cheap enough to stay.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 anim-fade-in delay-200">
          {/* Free */}
          <div className="glass glass-hover p-8 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] mb-2">Free</p>
              <p className="text-5xl font-bold">₹0</p>
              <p className="text-[var(--muted)] text-sm mt-1">Forever free tier</p>
            </div>
            <ul className="space-y-3">
              {[
                "3 full analyses per month",
                "All 6 context modes",
                "Brutal + safe tone",
                "Line-by-line breakdown",
                "5 better reply variants",
                "Replay simulation",
                "Pattern tracking",
                "2 bonus credits on signup",
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

          {/* Premium */}
          <div className="glass glass-hover glow-border p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="chip chip-active-purple text-[11px]">Popular</span>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] mb-2">Premium</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold grad-text">₹99</p>
                <p className="text-[var(--muted)] text-sm mb-1">/ month</p>
              </div>
              <p className="text-[var(--muted)] text-sm mt-1">Unlimited until you don&apos;t need it</p>
            </div>
            <ul className="space-y-3">
              {[
                "Unlimited analyses",
                "Everything in Free",
                "Priority processing queue",
                "Advanced pattern history",
                "PDF exports (roadmap)",
                "WhatsApp bot (roadmap)",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--accent)]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-primary w-full text-center">
              Get premium →
            </Link>
          </div>
        </div>

        {/* Credits */}
        <div className="glass p-7 space-y-4 anim-fade-in delay-300">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-2">
              <p className="font-semibold text-lg">Pay-per-analysis credits</p>
              <p className="text-sm text-[var(--muted)]">
                Run out of free analyses? Buy credits for occasional use — no subscription needed.
                Each credit = 1 full analysis (all 6 tabs, both stages).
              </p>
            </div>
            <div className="text-center glass p-4 rounded-xl">
              <p className="text-3xl font-bold text-[var(--warn)]">₹X</p>
              <p className="text-xs text-[var(--muted)] mt-1">per credit · coming soon</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-[var(--muted)] anim-fade-in delay-400">
          Razorpay / Stripe payments — coming soon. Upgrade &apos;plan&apos; field to &apos;premium&apos; in MongoDB for now.
        </div>
      </main>
    </>
  );
}
