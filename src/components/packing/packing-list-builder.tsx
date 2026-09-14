"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type PackingList = { summary: string; sections: Array<{ category: string; items: string[]; note: string }> };

export function PackingListBuilder() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [weather, setWeather] = useState("Mild");
  const [plans, setPlans] = useState("");
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [savingList, setSavingList] = useState(false);

  async function buildList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsBuilding(true);
    try {
      const response = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days: Number(days), weather, plans }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not build your packing list.");
      setPackingList(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not build your packing list.");
    } finally {
      setIsBuilding(false);
    }
  }
  async function saveList() { if (!packingList) return; setSavingList(true); try { const response = await fetch("/api/packing/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destination, days: Number(days), weather, plans, content: packingList }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage("Packing list saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "We could not save your list."); } finally { setSavingList(false); } }

  return <>
    <form onSubmit={buildList} className="mt-10 grid gap-4 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6 sm:grid-cols-2">
      <label><span className="mb-2 block text-sm font-medium">Where are you going?</span><input required value={destination} onChange={(event) => setDestination(event.target.value)} maxLength={80} placeholder="e.g. Edinburgh" className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
      <label><span className="mb-2 block text-sm font-medium">How many days?</span><input required type="number" min="1" max="21" value={days} onChange={(event) => setDays(event.target.value)} className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
      <label><span className="mb-2 block text-sm font-medium">Expected weather</span><select value={weather} onChange={(event) => setWeather(event.target.value)} className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3"><option>Warm</option><option>Mild</option><option>Cold</option><option>Mixed</option></select></label>
      <label><span className="mb-2 block text-sm font-medium">What are your plans?</span><input required value={plans} onChange={(event) => setPlans(event.target.value)} maxLength={160} placeholder="e.g. dinners, walking, one smart event" className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
      <Button disabled={isBuilding} className="h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037] sm:col-span-2">{isBuilding ? "Building your list…" : "Build my packing list"}</Button>
    </form>
    {message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}
    {packingList && <section className="mt-10"><Button type="button" variant="outline" onClick={saveList} disabled={savingList} className="mb-4 rounded-xl">{savingList ? "Saving…" : "Save this trip list"}</Button><p className="rounded-2xl bg-[#eee8e2] p-5 leading-7 text-[#544b43]">{packingList.summary}</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{packingList.sections.map((section) => <article key={section.category} className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5"><h2 className="text-lg font-semibold">{section.category}</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-[#544b43]">{section.items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden>□</span><span>{item}</span></li>)}</ul><p className="mt-4 border-t border-[#e5ddd5] pt-4 text-sm leading-6 text-[#766b61]">{section.note}</p></article>)}</div></section>}
  </>;
}
