"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Outfit = { outfit_id: string; title: string; explanation: string; items: Array<{ id: string; name: string; category: string; image_url?: string | null }> };
const occasions = [{ value: "casual", label: "Casual" }, { value: "uni", label: "Uni" }, { value: "work", label: "Work" }, { value: "evening", label: "Night out" }, { value: "formal", label: "Smart event" }];

export function GenerateOutfit() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("casual");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWearing, setIsWearing] = useState(false);
  const [worn, setWorn] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function generate() {
    setIsGenerating(true); setMessage(null); setWorn(false); setShareMessage(null);
    try { const response = await fetch("/api/outfits/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ occasion }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "We could not create an outfit."); setOutfit(result); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "We could not create an outfit."); } finally { setIsGenerating(false); }
  }

  async function markAsWorn() {
    if (!outfit) return;
    setIsWearing(true); setMessage(null);
    try { const response = await fetch("/api/outfits/wear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outfitId: outfit.outfit_id, wornOn: new Date().toISOString().slice(0, 10) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "We could not update your wear history."); setWorn(true); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "We could not update your wear history."); } finally { setIsWearing(false); }
  }

  async function share() {
    if (!outfit) return;
    const text = `My Style Set: ${outfit.title}. ${outfit.items.map((item) => item.name).join(", ")}.`;
    try { if (typeof navigator.share === "function") await navigator.share({ title: "My Style Set", text }); else await navigator.clipboard.writeText(text); setShareMessage(typeof navigator.share === "function" ? "Ready to share." : "Copied to your clipboard."); } catch { setShareMessage(null); }
  }

  return <section className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6">{!outfit ? <><p className="text-sm font-medium text-[#766b61]">CREATE A STYLE SET</p><h2 className="mt-2 text-2xl font-semibold">What are you dressing for?</h2><div className="mt-5 flex flex-wrap gap-2">{occasions.map((item) => <button key={item.value} type="button" onClick={() => setOccasion(item.value)} aria-pressed={occasion === item.value} className={`rounded-full border px-4 py-2 text-sm transition ${occasion === item.value ? "border-[#302a25] bg-[#302a25] text-white" : "border-[#d7cec5] bg-white text-[#544b43] hover:bg-[#f1ece7]"}`}>{item.label}</button>)}</div><Button onClick={generate} disabled={isGenerating} className="mt-6 h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{isGenerating ? "Creating your Style Set…" : "Create my Style Set →"}</Button></> : <div><p className="text-sm font-medium text-[#766b61]">YOUR STYLE SET</p><p className="mt-2 text-sm capitalize text-[#766b61]">{occasion.replace("-", " ")}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#302a25]">{outfit.title}</h2><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{outfit.items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl bg-[#eee8e2]">{item.image_url ? <Image unoptimized src={item.image_url} alt={item.name} width={360} height={440} className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] bg-[#e4dcd4]" />}<div className="p-3"><p className="text-xs font-medium uppercase tracking-wide text-[#766b61]">{item.category}</p><p className="mt-1 text-sm font-medium text-[#302a25]">{item.name}</p></div></article>)}</div><div className="mt-7 border-t border-[#e5ddd5] pt-6"><h3 className="text-lg font-semibold">Why it works</h3><p className="mt-2 max-w-2xl leading-7 text-[#62594f]">{outfit.explanation}</p></div><div className="mt-6 flex flex-wrap gap-x-5 gap-y-3"><span className="text-sm font-medium text-[#62594f]">♡ Saved</span><button type="button" onClick={share} className="text-sm font-medium text-[#62594f] hover:text-[#302a25]">↗ Share</button>{shareMessage && <span role="status" className="text-sm text-[#766b61]">{shareMessage}</span>}</div><Button type="button" onClick={markAsWorn} disabled={isWearing || worn} className="mt-6 h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{isWearing ? "Saving…" : worn ? "I’m wearing this ✓" : "I’m wearing this"}</Button><button type="button" onClick={generate} disabled={isGenerating} className="ml-4 text-sm font-medium text-[#62594f] hover:text-[#302a25]">{isGenerating ? "Creating…" : "Not feeling it? Try another →"}</button></div>}{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</section>;
}
