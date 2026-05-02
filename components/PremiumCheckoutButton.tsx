"use client";

import { useState } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "outline";
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Opens Razorpay Checkout after creating an order on the server.
 */
export function PremiumCheckoutButton({ className, children, variant = "primary" }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function launch() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/razorpay/create-order", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message ?? "Could not start checkout.";
        setErr(msg);
        setBusy(false);
        return;
      }

      await loadRazorpayScript();

      const keyId = data.keyId as string;
      const orderId = data.orderId as string;
      const amount = data.amount as number;
      const currency = (data.currency as string) ?? "INR";

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "Conv Replay",
        description: "Premium — 30 days unlimited analyses",
        theme: { color: "#c45cff" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const v = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const j = await v.json().catch(() => ({}));
          if (!v.ok) {
            setErr(j?.error?.message ?? "Payment verification failed.");
            setBusy(false);
            return;
          }
          window.location.href = "/app?upgraded=1";
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      };

      const Rzp = window.Razorpay;
      if (!Rzp) {
        setErr("Razorpay script did not load.");
        setBusy(false);
        return;
      }
      const rz = new Rzp(options);
      rz.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout failed.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void launch()}
        className={
          className ??
          (variant === "primary" ? "btn btn-primary w-full text-center" : "btn w-full text-center")
        }
      >
        {busy ? "Opening checkout…" : children ?? "Subscribe with Razorpay — ₹99 / 30 days"}
      </button>
      {err ? <p className="text-xs text-[var(--danger)]">{err}</p> : null}
    </div>
  );
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("checkout script"));
    document.body.appendChild(s);
  });
}
