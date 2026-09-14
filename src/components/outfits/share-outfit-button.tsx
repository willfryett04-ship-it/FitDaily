"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareOutfitButton({ title, occasion, pieces }: { title: string; occasion: string; pieces: string[] }) {
  const [message, setMessage] = useState<string | null>(null);
  async function share() {
    const text = `My Style Set look: ${title} for ${occasion}. ${pieces.join(", ")}.`;
    try {
      if (typeof navigator.share === "function") await navigator.share({ title: "My Style Set look", text });
      else await navigator.clipboard.writeText(text);
      setMessage(typeof navigator.share === "function" ? "Ready to share." : "Look copied to your clipboard.");
    } catch { setMessage(null); }
  }
  return <div className="mt-3"><Button type="button" variant="ghost" onClick={share} className="rounded-xl px-0 text-[#62594f] hover:bg-transparent">Share this look</Button>{message && <span role="status" className="ml-3 text-xs text-[#766b61]">{message}</span>}</div>;
}
