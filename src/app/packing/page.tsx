import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PackingListBuilder } from "@/components/packing/packing-list-builder";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Packing lists" };

export default async function PackingPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") redirect("/login");
  const { data: subscription } = await supabase.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing";

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10"><header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">Style Set</Link><Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button></header><section className="mx-auto max-w-4xl py-14"><p className="text-sm font-medium text-[#766b61]">PACKING LISTS {isPremium ? "· PREMIUM" : ""}</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">Pack less. Wear more.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">Tell us about your trip and get a thoughtful list built from clothes you already own.</p>{isPremium ? <PackingListBuilder /> : <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><p className="text-sm font-medium text-[#766b61]">PREMIUM FEATURE</p><h2 className="mt-3 text-2xl font-semibold">Travel with a wardrobe that works harder.</h2><p className="mt-3 max-w-lg leading-7 text-[#6f655d]">Premium members can generate trip-specific packing lists from their own wardrobe.</p><Button asChild className="mt-6 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]"><Link href="/premium">Explore Premium</Link></Button></section>}</section></main>;
}
