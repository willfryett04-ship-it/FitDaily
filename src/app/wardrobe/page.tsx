import Link from "next/link";
import { redirect } from "next/navigation";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { WardrobeGallery, type WardrobeItem } from "@/components/wardrobe/wardrobe-gallery";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type ClothingItem = { id: string; name: string; category: string; color: string | null; image_path: string | null; is_favorite: boolean };

export const metadata = { title: "Wardrobe" };

export default async function WardrobePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login");
  const { data } = await supabase.from("clothing_items").select("id, name, category, color, image_path, is_favorite").order("created_at", { ascending: false });
  const items = (data ?? []) as ClothingItem[];
  const imageUrls = await Promise.all(items.map(async (item) => {
    if (!item.image_path) return [item.id, null] as const;
    const { data: signed } = await supabase.storage.from("wardrobe").createSignedUrl(item.image_path, 3600);
    return [item.id, signed?.signedUrl ?? null] as const;
  }));
  const images = new Map(imageUrls);
  const galleryItems: WardrobeItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category as WardrobeItem["category"],
    color: item.color,
    imagePath: item.image_path,
    imageUrl: images.get(item.id) ?? null,
    isFavorite: item.is_favorite,
  }));

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/dashboard" className="text-xl font-semibold tracking-tight">fit daily</Link><Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button></header>
      <section className="mx-auto max-w-5xl py-14"><p className="text-sm font-medium text-[#766b61]">DIGITAL WARDROBE</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em]">Everything you own, in one place.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f655d]">Start with a few favourites. We’ll use these pieces to build your first recommendations.</p><div className="mt-10"><AddItemForm /></div>
        <WardrobeGallery initialItems={galleryItems} />
      </section>
    </main>
  );
}
