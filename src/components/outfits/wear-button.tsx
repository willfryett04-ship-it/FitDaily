"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WearButton({ outfitId, initialWearId }: { outfitId: string; initialWearId: string | null }) {
  const [wearId, setWearId] = useState(initialWearId);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function toggleWear() {
    setIsSaving(true); setMessage(null);
    try {
      const response = wearId ? await fetch("/api/outfits/wear", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: wearId }) }) : await fetch("/api/outfits/wear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outfitId, wornOn: new Date().toISOString().slice(0, 10) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not update your wear history.");
      setWearId(wearId ? null : result.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "We could not update your wear history."); } finally { setIsSaving(false); }
  }
  return <div className="mt-5"><Button type="button" variant="outline" disabled={isSaving} onClick={toggleWear} className="rounded-xl">{isSaving ? "Saving…" : wearId ? "Worn today ✓" : "Mark as worn today"}</Button>{message && <p role="status" className="mt-2 text-sm text-[#8a4f46]">{message}</p>}</div>;
}
