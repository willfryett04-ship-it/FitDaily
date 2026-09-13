import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OutfitPlanner, type PlannedOutfit, type PlannerOutfit } from "@/components/planner/outfit-planner";
import { createClient } from "@/lib/supabase/server";

type PlannerRow = { id: string; outfit_id: string; planned_for: string; outfits: Array<{ title: string; occasion: string }> };

export const metadata = { title: "Planner" };

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login");

  const [{ data: outfitData }, { data: planData }] = await Promise.all([
    supabase.from("outfits").select("id, title, occasion").order("created_at", { ascending: false }),
    supabase.from("planned_outfits").select("id, outfit_id, planned_for, outfits(title, occasion)").order("planned_for", { ascending: true }),
  ]);
  const outfits = (outfitData ?? []) as PlannerOutfit[];
  const plans = (planData ?? [] as PlannerRow[]).flatMap((plan): PlannedOutfit[] => plan.outfits[0] ? [{ id: plan.id, outfitId: plan.outfit_id, plannedFor: plan.planned_for, outfit: { id: plan.outfit_id, ...plan.outfits[0] } }] : []);
  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">fit daily</Link><Button asChild variant="outline"><Link href="/outfits">AI Stylist</Link></Button></header>
      <section className="mx-auto max-w-5xl py-14"><p className="text-sm font-medium text-[#766b61]">OUTFIT PLANNER</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">Make getting dressed one less decision.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">Plan the saved looks you want to wear, then come back to a calmer morning.</p><OutfitPlanner outfits={outfits} initialPlans={plans} defaultDate={defaultDate} /></section>
    </main>
  );
}
