import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PremiumActions } from "@/components/payments/premium-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Style Set Premium" };

export default async function PremiumPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");
  const { data: subscription } = await supabase.from("subscriptions").select("status").eq("user_id", auth.claims.sub).maybeSingle();
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing";
  const { checkout } = await searchParams;

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10"><header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">Style Set</Link><Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button></header><section className="mx-auto max-w-2xl py-14"><p className="text-sm font-medium text-[#766b61]">FIT DAILY PREMIUM</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">More looks. Less second-guessing.</h1><p className="mt-5 text-lg leading-8 text-[#6f655d]">Your wardrobe now comes with a personal stylist, a calmer weekly routine, and travel planning that starts with what you own.</p>{checkout === "success" && <p role="status" className="mt-6 rounded-xl bg-[#e7f0e7] p-4 text-sm text-[#34503b]">Payment confirmed — your Premium access is being activated.</p>}{checkout === "cancelled" && <p role="status" className="mt-6 rounded-xl bg-[#efe9e1] p-4 text-sm text-[#544b43]">No payment was made. You can return whenever you’re ready.</p>}<div className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><p className="text-lg font-semibold">{isPremium ? "You’re a Premium member" : "Style Set Premium"}</p><p className="mt-2 text-sm leading-6 text-[#6f655d]">{isPremium ? "Manage or cancel your plan securely through Stripe." : "Your price and secure checkout will appear here once billing is configured."}</p><PremiumActions isPremium={isPremium} /></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Link href="/stylist" className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5 hover:bg-white"><p className="font-semibold">AI Stylist</p><p className="mt-2 text-sm leading-6 text-[#6f655d]">Advice based on your own clothes.</p></Link><Link href="/planner" className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5 hover:bg-white"><p className="font-semibold">Outfit Planner</p><p className="mt-2 text-sm leading-6 text-[#6f655d]">Put saved looks on the calendar.</p></Link><Link href="/packing" className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5 hover:bg-white"><p className="font-semibold">Packing Lists</p><p className="mt-2 text-sm leading-6 text-[#6f655d]">Plan a trip from your wardrobe.</p></Link></div></section></main>;
}
