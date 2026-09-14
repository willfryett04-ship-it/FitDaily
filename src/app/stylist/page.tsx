import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StylistChat } from "@/components/stylist/stylist-chat";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "AI Stylist" };

export default async function StylistPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") redirect("/login");
  const { data: subscription } = await supabase.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing";

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10"><header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">fit daily</Link><Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button></header><section className="mx-auto max-w-3xl py-14"><p className="text-sm font-medium text-[#766b61]">AI STYLIST {isPremium ? "· PREMIUM" : ""}</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">Advice that starts with your wardrobe.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">Ask for help with an occasion, a tricky piece, or packing. Your stylist only recommends items you’ve added to Fit Daily.</p><StylistChat isPremium={isPremium} /></section></main>;
}
