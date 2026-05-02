"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <>
      <div className="bg-mesh pointer-events-none opacity-60" />
      <main className="relative mx-auto max-w-2xl space-y-8 px-6 py-10">
        <header className="space-y-2 anim-fade-in">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent2)]">
            Setup &amp; troubleshooting
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Environment</h1>
          <p className="text-sm text-[var(--muted)]">
            Keys are never shown in the browser. Use this checklist if analyses fail.
          </p>
        </header>

        <section className="glass space-y-4 p-6 anim-fade-in delay-100">
          <h2 className="font-semibold text-[var(--accent2)]">Groq API key (401 / invalid key)</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-[var(--muted)] leading-relaxed">
            <li>
              Create an API key at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                console.groq.com/keys
              </a>{" "}
              (keys start with <code className="font-mono text-xs">gsk_</code>).
            </li>
            <li>
              In your project root, add to <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env</code>:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">GROQ_API_KEY=gsk_...</code>
            </li>
            <li>
              <strong className="text-[var(--text)]">Important:</strong> If <code className="font-mono text-xs">.env.local</code>{" "}
              also sets <code className="font-mono text-xs">GROQ_API_KEY</code>, it overrides <code className="font-mono text-xs">.env</code>.
              Remove duplicates or wrong placeholders.
            </li>
            <li>
              Restart the dev server after changing env:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">npm run dev</code>.
            </li>
          </ol>
        </section>

        <section className="glass space-y-4 p-6 anim-fade-in delay-150">
          <h2 className="font-semibold text-[var(--accent2)]">TLS / &ldquo;unable to get local issuer certificate&rdquo;</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            If requests to Groq fail with a certificate or <code className="font-mono text-xs">fetch failed</code> error,
            Node may not trust your network&apos;s certificate chain (VPN, antivirus HTTPS scanning, or a missing corporate root CA).
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--muted)] leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">Proper fix:</strong> ask IT for the root CA bundle, then set{" "}
              <code className="rounded bg-white/10 px-1 font-mono text-xs">NODE_EXTRA_CA_CERTS=/full/path/to/root.pem</code>{" "}
              in the environment before <code className="font-mono text-xs">npm run dev</code> (or export it in your shell profile).
            </li>
            <li>
              <strong className="text-[var(--text)]">Local dev only:</strong> add{" "}
              <code className="rounded bg-white/10 px-1 font-mono text-xs">GROQ_TLS_INSECURE=1</code> to{" "}
              <code className="font-mono text-xs">.env</code> — this disables TLS verification only for Groq API calls.
              Remove it before production deploys.
            </li>
          </ul>
        </section>

        <section className="glass space-y-4 p-6 anim-fade-in delay-200">
          <h2 className="font-semibold text-[var(--accent2)]">MongoDB</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Default local URI:{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              mongodb://127.0.0.1:27017/convoreplay
            </code>
            . Start MongoDB locally or set <code className="font-mono text-xs">MONGODB_URI</code> to Atlas.
          </p>
        </section>

        <section className="glass space-y-4 p-6 anim-fade-in delay-300">
          <h2 className="font-semibold text-[var(--accent2)]">Session secret</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Set <code className="font-mono text-xs">AUTH_SECRET</code> to a long random string (24+ characters) in{" "}
            <code className="font-mono text-xs">.env</code> or <code className="font-mono text-xs">.env.local</code>.
          </p>
        </section>

        <div className="flex flex-wrap gap-3 anim-fade-in delay-400">
          <Link href="/app/new" className="btn btn-primary">
            Try new analysis →
          </Link>
          <Link href="/app" className="btn">
            Dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
