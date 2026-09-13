"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PremiumActions({ isPremium }: { isPremium: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);

  async function openStripe(endpoint: "/api/stripe/checkout" | "/api/stripe/portal", action: "checkout" | "portal") {
    setLoading(action);
    setMessage(null);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "We could not open Stripe.");
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not open Stripe.");
      setLoading(null);
    }
  }

  return <div className="mt-8"><Button onClick={() => openStripe(isPremium ? "/api/stripe/portal" : "/api/stripe/checkout", isPremium ? "portal" : "checkout")} disabled={loading !== null} className="rounded-xl bg-[#302a25] px-6 text-white hover:bg-[#4a4037]">{loading ? "Opening secure billing…" : isPremium ? "Manage billing" : "Start Premium"}</Button>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</div>;
}
