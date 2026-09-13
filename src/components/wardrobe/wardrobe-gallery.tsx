"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const categories = ["all", "top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"] as const;
type Category = (typeof categories)[number];

export type WardrobeItem = {
  id: string;
  name: string;
  category: Exclude<Category, "all">;
  color: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
};

export function WardrobeGallery({ initialItems }: { initialItems: WardrobeItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const visibleItems = useMemo(
    () => selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory),
    [items, selectedCategory],
  );

  async function removeItem(item: WardrobeItem) {
    if (!window.confirm(`Remove ${item.name} from your wardrobe? This cannot be undone.`)) return;
    setRemovingId(item.id);
    setMessage(null);
    try {
      const response = await fetch("/api/wardrobe/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not remove this item.");
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not remove this item.");
    } finally {
      setRemovingId(null);
    }
  }

  async function toggleFavorite(item: WardrobeItem) {
    setUpdatingFavoriteId(item.id);
    setMessage(null);
    try {
      const response = await fetch("/api/wardrobe/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isFavorite: !item.isFavorite }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not update this favourite.");
      setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, isFavorite: result.is_favorite } : currentItem));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not update this favourite.");
    } finally {
      setUpdatingFavoriteId(null);
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Your pieces</h2>
          <p className="mt-1 text-sm text-[#6f655d]">{items.length} {items.length === 1 ? "item" : "items"} in your wardrobe</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter wardrobe by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${selectedCategory === category ? "border-[#302a25] bg-[#302a25] text-white" : "border-[#d7cec5] bg-[#fcfbf9] text-[#62594f] hover:border-[#9f9388]"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {message && <p role="status" className="mt-5 rounded-xl bg-[#f2e5e2] p-3 text-sm text-[#74443c]">{message}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9]">
            {item.imageUrl ? <Image unoptimized src={item.imageUrl} alt={item.name} width={600} height={600} className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-[#eee8e2]" aria-label={`${item.name} has no image`} />}
            <div className="flex items-start justify-between gap-3 p-5">
              <div><p className="text-lg font-semibold">{item.name}</p><p className="mt-1 text-sm capitalize text-[#6f655d]">{[item.category, item.color].filter(Boolean).join(" · ")}</p></div>
              <div className="flex gap-1"><Button type="button" variant="ghost" size="icon" aria-label={item.isFavorite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`} className={item.isFavorite ? "rounded-xl text-[#9b5147] hover:bg-[#f5e7e4] hover:text-[#713a32]" : "rounded-xl text-[#766b61] hover:bg-[#eee8e2]"} onClick={() => toggleFavorite(item)} disabled={updatingFavoriteId === item.id}><Heart fill={item.isFavorite ? "currentColor" : "none"} /></Button><Button type="button" variant="ghost" className="rounded-xl text-[#8a4f46] hover:bg-[#f5e7e4] hover:text-[#713a32]" onClick={() => removeItem(item)} disabled={removingId === item.id}>{removingId === item.id ? "Removing…" : "Remove"}</Button></div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && <p className="mt-10 rounded-3xl border border-dashed border-[#cfc5bb] p-10 text-center text-[#6f655d]">Your wardrobe is waiting for its first piece.</p>}
      {!!items.length && !visibleItems.length && <p className="mt-10 rounded-3xl border border-dashed border-[#cfc5bb] p-10 text-center text-[#6f655d]">No {selectedCategory} items yet. Try another filter or add one above.</p>}
    </section>
  );
}
