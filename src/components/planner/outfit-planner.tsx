"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type PlannerOutfit = { id: string; title: string; occasion: string };
export type PlannedOutfit = { id: string; outfitId: string; plannedFor: string; outfit: PlannerOutfit };

export function OutfitPlanner({ outfits, initialPlans, defaultDate, isPremium }: { outfits: PlannerOutfit[]; initialPlans: PlannedOutfit[]; defaultDate: string; isPremium: boolean }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [outfitId, setOutfitId] = useState(outfits[0]?.id ?? "");
  const [plannedFor, setPlannedFor] = useState(defaultDate);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const outfitById = useMemo(() => new Map(outfits.map((outfit) => [outfit.id, outfit])), [outfits]);

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outfitId, plannedFor }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not save your plan.");
      const outfit = outfitById.get(result.outfit_id);
      if (!outfit) throw new Error("That saved outfit is no longer available.");
      const nextPlan: PlannedOutfit = { id: result.id, outfitId: result.outfit_id, plannedFor: result.planned_for, outfit };
      setPlans((current) => [...current.filter((plan) => plan.plannedFor !== nextPlan.plannedFor), nextPlan].sort((a, b) => a.plannedFor.localeCompare(b.plannedFor)));
      setMessage("Your outfit is in the planner.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not save your plan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removePlan(plan: PlannedOutfit) {
    if (!window.confirm(`Remove ${plan.outfit.title} from ${plan.plannedFor}?`)) return;
    setRemovingId(plan.id);
    setMessage(null);
    try {
      const response = await fetch("/api/planner", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: plan.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not remove this plan.");
      setPlans((current) => current.filter((currentPlan) => currentPlan.id !== plan.id));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not remove this plan.");
    } finally {
      setRemovingId(null);
    }
  }

  if (!isPremium) return <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><p className="text-sm font-medium text-[#766b61]">PREMIUM FEATURE</p><h2 className="mt-3 text-2xl font-semibold">Plan the week ahead with confidence.</h2><p className="mt-3 max-w-lg leading-7 text-[#6f655d]">Premium unlocks the outfit planner, so your saved looks are ready when your morning is busy.</p><Button asChild className="mt-6 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]"><Link href="/premium">Explore Premium</Link></Button></section>;
  if (!outfits.length) return <p className="mt-10 rounded-3xl border border-dashed border-[#cfc5bb] p-10 text-center text-[#6f655d]">Create a saved outfit with your AI stylist before adding it to the planner.</p>;

  return (
    <>
      <form onSubmit={savePlan} className="mt-10 grid gap-4 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label><span className="mb-2 block text-sm font-medium">Saved outfit</span><select value={outfitId} onChange={(event) => setOutfitId(event.target.value)} className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3">{outfits.map((outfit) => <option key={outfit.id} value={outfit.id}>{outfit.title} · {outfit.occasion}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-medium">Wear it on</span><input required type="date" value={plannedFor} onChange={(event) => setPlannedFor(event.target.value)} className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
        <Button disabled={isSaving} className="h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{isSaving ? "Saving…" : "Add to planner"}</Button>
      </form>
      {message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">Your planned looks</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => <article key={plan.id} className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5"><p className="text-xs font-medium uppercase tracking-wide text-[#766b61]">{plan.plannedFor}</p><h3 className="mt-3 text-lg font-semibold">{plan.outfit.title}</h3><p className="mt-1 text-sm capitalize text-[#6f655d]">{plan.outfit.occasion}</p><Button type="button" variant="ghost" className="mt-5 rounded-xl px-0 text-[#8a4f46] hover:bg-transparent hover:text-[#713a32]" disabled={removingId === plan.id} onClick={() => removePlan(plan)}>{removingId === plan.id ? "Removing…" : "Remove from planner"}</Button></article>)}
        </div>
        {!plans.length && <p className="mt-5 rounded-3xl border border-dashed border-[#cfc5bb] p-10 text-center text-[#6f655d]">Pick a saved look and assign it to a day. You can replace an outfit for the same date whenever you like.</p>}
      </section>
    </>
  );
}
