"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppRouteError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-12">
      <p className="text-4xl">⚠️</p>
      <h1 className="text-lg font-bold text-center text-[var(--text)]">Could not render this screen</h1>
      <p className="text-sm text-[var(--muted)] text-center max-w-md">
        Data from the server may be incomplete. Try refreshing. If it persists, check the browser console (F12) for the
        exact error.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => reset()}>
          Retry
        </button>
        <Link href="/app" className="btn btn-sm">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
