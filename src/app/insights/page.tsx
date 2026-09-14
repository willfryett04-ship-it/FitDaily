import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buildPalette } from "@/lib/wardrobe-colors";
import { createClient } from "@/lib/supabase/server";

type Item = { id: string; name: string; category: string; color: string | null; is_favorite: boolean };
type OutfitItem = { clothing_item_id: string };

export const metadata = { title: "Wardrobe insights" };

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login");
  const [{ data: itemData }, { data: outfitData }] = await Promise.all([
    supabase.from("clothing_items").select("id, name, category, color, is_favorite").order("created_at", { ascending: true }),
    supabase.from("outfits").select("outfit_items(clothing_item_id)"),
  ]);
  const items = (itemData ?? []) as Item[];
  const styledItemIds = new Set((outfitData ?? []).flatMap((outfit) => ((outfit.outfit_items ?? []) as OutfitItem[]).map((item) => item.clothing_item_id)));
  const unused = items.filter((item) => !styledItemIds.has(item.id)).slice(0, 4);
  const palette = buildPalette(items.map((item) => item.color));
  const categoryCount = new Set(items.map((item) => item.category)).size;

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10"><header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">fit daily</Link><Button asChild variant="outline"><Link href="/wardrobe">Wardrobe</Link></Button></header><section className="mx-auto max-w-5xl py-14"><p className="text-sm font-medium text-[#766b61]">WARDROBE INSIGHTS</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">Get more from what you own.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">A quick picture of the pieces, colours, and outfit potential already in your wardrobe.</p>{items.length ? <><div className="mt-10 grid gap-4 sm:grid-cols-3"><article className="rounded-3xl bg-[#302a25] p-6 text-white"><p className="text-xs font-medium tracking-[0.14em] text-[#d8d0c8]">WARDROBE</p><p className="mt-5 text-5xl font-semibold">{items.length}</p><p className="mt-2 text-[#d8d0c8]">pieces to style</p></article><article className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">IN ROTATION</p><p className="mt-5 text-5xl font-semibold">{styledItemIds.size}</p><p className="mt-2 text-[#6f655d]">pieces used in saved looks</p></article><article className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">RANGE</p><p className="mt-5 text-5xl font-semibold">{categoryCount}</p><p className="mt-2 text-[#6f655d]">clothing categories</p></article></div><section className="mt-8 grid gap-4 sm:grid-cols-2"><article className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">TRY SOMETHING NEW</p><h2 className="mt-3 text-2xl font-semibold">Pieces waiting for a look</h2>{unused.length ? <ul className="mt-5 space-y-3">{unused.map((item) => <li key={item.id} className="rounded-xl bg-[#f1ece6] px-4 py-3 text-sm"><span className="font-medium">{item.name}</span><span className="ml-2 capitalize text-[#766b61]">{item.category}</span></li>)}</ul> : <p className="mt-5 leading-7 text-[#6f655d]">Every piece has appeared in a saved look. Your wardrobe is working hard.</p>}<Button asChild variant="outline" className="mt-5 rounded-xl"><Link href="/outfits">Create a new outfit</Link></Button></article><article className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">COLOUR DIRECTION</p><h2 className="mt-3 text-2xl font-semibold">Your most-used palette</h2>{palette.length ? <div className="mt-5 flex overflow-hidden rounded-2xl border border-[#e5ddd5]">{palette.slice(0, 5).map((color) => <div key={color.name} className="h-24 flex-1" style={{ backgroundColor: color.hex }} title={color.name} />)}</div> : <p className="mt-5 leading-7 text-[#6f655d]">Add colour details to your clothing items to see your palette.</p>}<Button asChild variant="outline" className="mt-5 rounded-xl"><Link href="/palette">Open colour palette</Link></Button></article></section></> : <section className="mt-10 rounded-3xl border border-dashed border-[#cfc5bb] p-10 text-center"><h2 className="text-2xl font-semibold">Your insights will grow with your wardrobe.</h2><Button asChild className="mt-6 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]"><Link href="/wardrobe">Add your first piece</Link></Button></section>}</section></main>;
}
