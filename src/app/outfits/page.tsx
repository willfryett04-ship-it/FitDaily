import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GenerateOutfit } from "@/components/outfits/generate-outfit";
import { createClient } from "@/lib/supabase/server";

type ClothingItem = { id: string; name: string; category: string; color: string | null; image_path: string | null };
type OutfitItem = { position: number; clothing_items: ClothingItem[] };
type OutfitHistory = { id: string; title: string; occasion: string; explanation: string; created_at: string; outfit_items: OutfitItem[] | null };
export const metadata = { title: "Outfits" };

export default async function OutfitsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login");
  const { data } = await supabase
    .from("outfits")
    .select("id, title, occasion, explanation, created_at, outfit_items(position, clothing_items(id, name, category, color, image_path))")
    .order("created_at", { ascending: false });
  const history = (data ?? []) as OutfitHistory[];
  const outfitItems = history.flatMap((outfit) => (outfit.outfit_items ?? []).flatMap((item) => item.clothing_items));
  const uniqueImagePaths = [...new Set(outfitItems.flatMap((item) => item.image_path ? [item.image_path] : []))];
  const imagePairs = await Promise.all(uniqueImagePaths.map(async (path) => {
    const { data: signed } = await supabase.storage.from("wardrobe").createSignedUrl(path, 3600);
    return [path, signed?.signedUrl ?? null] as const;
  }));
  const images = new Map(imagePairs);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">fit daily</Link><Button asChild variant="outline"><Link href="/wardrobe">Wardrobe</Link></Button></header>
      <section className="mx-auto max-w-5xl py-14">
        <p className="text-sm font-medium text-[#766b61]">AI STYLIST</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">A look for wherever you’re going.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">Your stylist only chooses from the clothes already in your wardrobe.</p>
        <div className="mt-10"><GenerateOutfit /></div>

        <h2 className="mt-14 text-2xl font-semibold">Outfit history</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {history.map((outfit) => {
            const pieces = [...(outfit.outfit_items ?? [])].sort((a, b) => a.position - b.position).flatMap((item) => item.clothing_items);
            return (
              <article key={outfit.id} className="overflow-hidden rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9]">
                <div className="grid grid-cols-3 bg-[#eee8e2]">
                  {pieces.slice(0, 3).map((item) => images.get(item.image_path ?? "") ? <Image key={item.id} unoptimized src={images.get(item.image_path ?? "")!} alt={item.name} width={300} height={300} className="aspect-square w-full object-cover" /> : <div key={item.id} className="aspect-square border-r border-[#e5ddd5]" />)}
                  {!pieces.length && <div className="col-span-3 aspect-[3/1]" />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#766b61]">{outfit.occasion}</p>
                  <h3 className="mt-2 text-lg font-semibold">{outfit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#62594f]">{outfit.explanation}</p>
                  {!!pieces.length && <ul className="mt-4 flex flex-wrap gap-2">{pieces.map((item) => <li key={item.id} className="rounded-full bg-[#f1ece6] px-3 py-1 text-xs text-[#544b43]">{item.name}</li>)}</ul>}
                </div>
              </article>
            );
          })}
        </div>
        {!history.length && <p className="mt-5 rounded-2xl border border-dashed border-[#cfc5bb] p-8 text-center text-[#6f655d]">Your saved looks will appear here.</p>}
      </section>
    </main>
  );
}
