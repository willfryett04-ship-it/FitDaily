"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OutfitFeedback({ outfitId, initialFeedback }: { outfitId: string; initialFeedback: "loved" | "not_for_me" | null }) {
  const [feedback, setFeedback] = useState(initialFeedback); const [saving, setSaving] = useState(false);
  async function save(next: "loved" | "not_for_me") { setSaving(true); try { const response = await fetch("/api/outfits/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outfitId, feedback: next === feedback ? null : next }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setFeedback(result.feedback); } finally { setSaving(false); } }
  return <div className="mt-3 flex gap-2"><Button type="button" variant="ghost" disabled={saving} onClick={() => save("loved")} className={`h-8 rounded-lg px-2 text-xs ${feedback === "loved" ? "bg-[#e7f0e7] text-[#34503b]" : "text-[#62594f]"}`}>Loved it</Button><Button type="button" variant="ghost" disabled={saving} onClick={() => save("not_for_me")} className={`h-8 rounded-lg px-2 text-xs ${feedback === "not_for_me" ? "bg-[#f2e5e2] text-[#74443c]" : "text-[#62594f]"}`}>Not for me</Button></div>;
}
