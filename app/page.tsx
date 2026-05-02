import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative mx-auto max-w-6xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-7 anim-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold grad-text tracking-tight">Conversation Replay</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="#features" className="nav-pill hidden sm:inline-flex">
              Features
            </Link>
            <Link href="#faq" className="nav-pill hidden md:inline-flex">
              FAQ
            </Link>
            <Link href="/pricing" className="nav-pill">
              Pricing
            </Link>
            <Link href="/login" className="btn btn-sm">Sign in</Link>
            <Link href="/register" className="btn btn-sm btn-primary">Get started</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center text-center pt-20 pb-24 gap-8">
          <div className="chip chip-active-purple anim-fade-in">
            <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
            AI Communication Coach · Now in MVP
          </div>

          <h1 className="anim-fade-in delay-100 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl">
            Understand what{" "}
            <span className="grad-text">really happened</span>
            <br />in your conversations.
          </h1>

          <p className="anim-fade-in delay-200 text-lg md:text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
            Paste any chat — WhatsApp, Slack, Instagram, email. Get a line-by-line breakdown,
            hidden intent decoded, five better replies, and a replay of how things could have gone.
          </p>

          <div className="anim-fade-in delay-300 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn btn-lg btn-primary">
              Analyze a conversation →
            </Link>
            <Link href="/login" className="btn btn-lg">
              Sign in
            </Link>
          </div>

          <p className="anim-fade-in delay-400 text-sm text-[var(--muted)]">
            1 free analysis / month · No credit card required
          </p>

          {/* Demo card */}
          <div className="anim-fade-in delay-500 w-full max-w-3xl mt-8">
            <div className="glass glow-border rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-[var(--muted)] font-mono">live analysis preview</span>
              </div>
              {[
                { speaker: "Me", text: "Hey are you free tonight? I really want to see you, it's been so long and I miss hanging out", cls: "turn-me" },
                { speaker: "Alex", text: "maybe, idk, kinda tired tbh", cls: "turn-other" },
                { speaker: "Me", text: "okay no worries!! totally understand, we can do it another time, whenever is good for you 😊", cls: "turn-me" },
              ].map((t, i) => (
                <div key={i} className={`${t.cls} glass rounded-lg px-4 py-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--muted)]">{t.speaker}</span>
                    {i === 0 && <span className="chip chip-active-red text-[10px] py-0.5 px-2">neediness detected</span>}
                    {i === 2 && <span className="chip chip-active-orange text-[10px] py-0.5 px-2">weak framing · severity 4</span>}
                  </div>
                  <p className="text-sm leading-relaxed">{t.text}</p>
                </div>
              ))}
              <div className="divider my-2" />
              <div className="glass rounded-lg p-4 space-y-2">
                <p className="text-xs font-mono text-[var(--accent2)] font-semibold uppercase tracking-wider">Better reply (assertive)</p>
                <p className="text-sm leading-relaxed text-[var(--text)]">
                  &ldquo;Would love to catch up. I&apos;m free Saturday evening — does that work?&rdquo;
                </p>
                <p className="text-xs text-[var(--muted)]">Confident · specific · doesn&apos;t over-explain or beg</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-10 anim-fade-in delay-300">
          {[
            { n: "7", label: "Mistake types\ndetected", color: "var(--accent)" },
            { n: "5", label: "Better reply\nvariants", color: "var(--accent2)" },
            { n: "8", label: "Context\nmodes", color: "var(--warn)" },
            { n: "2x", label: "LLM stage\nanalysis", color: "var(--purple)" },
          ].map((s) => (
            <div key={s.label} className="glass glass-hover p-5 text-center">
              <p className="text-4xl font-bold" style={{ color: s.color }}>{s.n}</p>
              <p className="mt-1 text-xs text-[var(--muted)] leading-snug whitespace-pre-line">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section id="features" className="py-16 space-y-4">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">What you get</p>
            <h2 className="text-3xl md:text-4xl font-bold">Every angle. No fluff.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`glass glass-hover p-6 space-y-3 anim-fade-in`} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold text-[var(--text)]">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Context modes */}
        <section className="py-16">
          <div className="glass glow-border-teal p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">8 context modes</p>
                <h2 className="text-3xl font-bold leading-tight">Calibrated for the situation.</h2>
                <p className="text-[var(--muted)] leading-relaxed">
                  Dating is different from negotiation. Job interviews are different from conflicts.
                  The coach switches mental model entirely — not just vocabulary.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Dating", "Interview", "Workplace", "Friendship", "Conflict", "Negotiation"].map((c) => (
                  <span key={c} className="chip chip-active-teal text-sm">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tone selector */}
        <section className="py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-8 space-y-4 border border-[rgba(255,107,122,0.25)]">
              <p className="text-2xl">🔥</p>
              <h3 className="text-xl font-bold text-[var(--danger)]">Brutal Truth Mode</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                No sugarcoating. We name what you did, what it looked like, and why it hurt your position.
                Every critique paired with a concrete move.
              </p>
              <div className="glass rounded-xl p-4 text-sm border border-[rgba(255,107,122,0.2)]">
                <p className="italic text-[var(--muted)]">&ldquo;Your line at turn 3 reads as pure desperation. Here&apos;s what you should have sent instead.&rdquo;</p>
              </div>
            </div>
            <div className="glass p-8 space-y-4 border border-[rgba(92,240,216,0.25)]">
              <p className="text-2xl">🌿</p>
              <h3 className="text-xl font-bold text-[var(--accent2)]">Safe Mode</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                Same honest analysis. Soft packaging. Critique framed as learnable skills —
                no shame, no name-calling, always actionable.
              </p>
              <div className="glass rounded-xl p-4 text-sm border border-[rgba(92,240,216,0.2)]">
                <p className="italic text-[var(--muted)]">&ldquo;There&apos;s an opportunity here to express yourself with more confidence. Here&apos;s how…&rdquo;</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">FAQ</p>
            <h2 className="text-3xl font-bold">Common questions</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="glass group rounded-xl border border-white/[0.08] p-0 open:border-[var(--accent)]/30 open:shadow-[0_0_24px_rgba(196,92,255,0.08)]"
              >
                <summary className="cursor-pointer list-none px-6 py-4 font-semibold [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="text-[var(--accent2)] transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t border-white/[0.06] px-6 pb-5 pt-0 text-sm text-[var(--muted)] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Stop replaying it in your head.
            <br />
            <span className="grad-text">We&apos;ll replay it for you.</span>
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            Paste a conversation right now. You&apos;ll have your full breakdown in under 60 seconds.
          </p>
          <Link href="/register" className="btn btn-lg btn-primary mx-auto">
            Start free — no card needed →
          </Link>
        </section>

        {/* Footer */}
        <footer className="divider" />
        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-[var(--muted)]">
          <p className="grad-text font-bold">Conversation Replay AI</p>
          <p>Not therapy. Not legal advice. Just real coaching.</p>
          <Link href="/pricing" className="hover:text-[var(--text)]">Pricing</Link>
        </footer>
      </main>
    </>
  );
}

const FEATURES = [
  {
    icon: "🔍",
    title: "Line-by-line breakdown",
    body: "Every message you sent is annotated. Mistake type, severity 1–5, exact quote, why it reads that way.",
  },
  {
    icon: "🧠",
    title: "Hidden intent decoder",
    body: "What did they really mean? Sarcasm, avoidance, dominance, mixed signals — confidence-scored hypotheses.",
  },
  {
    icon: "⚖️",
    title: "Power dynamics",
    body: "Who was framing the conversation? Whose frame won? Where you gave away leverage.",
  },
  {
    icon: "✍️",
    title: "5 better replies",
    body: "Confident, polite, assertive, high-status, minimal. All generated for your specific pivotal moment.",
  },
  {
    icon: "🎬",
    title: "Replay simulation",
    body: "4–6 turn simulation: how the thread might have gone if you had sent the assertive reply. Clearly labeled hypothetical.",
  },
  {
    icon: "📈",
    title: "Learning engine",
    body: "Recurring patterns tracked across analyses so you see what you repeat — not to judge, to improve.",
  },
];

const FAQ = [
  {
    q: "Is this therapy or legal advice?",
    a: "No. It is analytical communication coaching from a transcript. For mental health or legal issues, see a qualified professional.",
  },
  {
    q: "Why do I get a 401 from Groq?",
    a: "Usually a bad or overridden API key. Next.js loads .env.local after .env — duplicate GROQ_API_KEY in .env.local can mask your real key. Use a key starting with gsk_ from console.groq.com/keys, put it in only one place or ensure .env.local is correct, then restart npm run dev.",
  },
  {
    q: "What formats work?",
    a: "Paste plain text from any chat app. For screenshots, use PNG/JPG/WebP/GIF under 4MB; we OCR with Groq vision then analyze with Llama.",
  },
  {
    q: "How accurate is “what they meant”?",
    a: "Inference only — we label hypotheses with confidence and observable signals. Nothing is claimed as mind-reading.",
  },
  {
    q: "What’s the difference between Brutal and Safe?",
    a: "Same engine and insight. Brutal uses blunt language; Safe wraps critique in supportive framing.",
  },
];
