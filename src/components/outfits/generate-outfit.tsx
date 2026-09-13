"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Outfit = { title: string; explanation: string; item_ids: string[]; items: Array<{ id: string; name: string; category: string; color: string | null }> };

export function GenerateOutfit() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("casual");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate() {
    setIsGenerating(true); setMessage(null);
    try {
      const response = await fetch("/api/outfits/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ occasion }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not create an outfit.");
      setOutfit(result); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not create an outfit.");
    } finally {
      setIsGenerating(false);
    }
  }

  return <section className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><label className="block"><span className="mb-2 block text-sm font-medium">What are you dressing for?</span><select value={occasion} onChange={(event) => setOccasion(event.target.value)} className="h-11 min-w-48 rounded-xl border border-[#d7cec5] bg-white px-3"><option value="casual">Everyday casual</option><option value="work">Work</option><option value="evening">Evening out</option><option value="formal">Something formal</option><option value="active">Active day</option></select></label><Button onClick={generate} disabled={isGenerating} className="h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{isGenerating ? "Styling…" : "✨ Create an outfit"}</Button></div>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}{outfit && <div className="mt-6 rounded-2xl bg-[#f1ece6] p-5"><p className="text-xl font-semibold">{outfit.title}</p><p className="mt-2 text-[#62594f]">{outfit.explanation}</p><ul className="mt-4 flex flex-wrap gap-2">{outfit.items.map((item) => <li key={item.id} className="rounded-full bg-white px-3 py-1.5 text-sm">{item.name}</li>)}</ul></div>}</section>;
}
