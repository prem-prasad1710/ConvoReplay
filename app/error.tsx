"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-16 bg-[#050508] text-[var(--text)]">
      <p className="text-4xl">⚠️</p>
      <h1 className="text-xl font-bold text-center">Something broke on this page</h1>
      <p className="text-sm text-[var(--muted)] text-center max-w-md">
        This is usually a display bug with loaded data. Try again, or open the browser console (F12) and share the
        first red error line if it keeps happening.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn">
          Home
        </Link>
      </div>
    </div>
  );
}
