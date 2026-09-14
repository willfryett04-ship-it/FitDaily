import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const deleteItemSchema = z.object({ id: z.string().uuid() });
const updateItemSchema = z.object({ id: z.string().uuid(), isFavorite: z.boolean().optional(), isInLaundry: z.boolean().optional() }).refine((value) => value.isFavorite !== undefined || value.isInLaundry !== undefined);

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const payload = updateItemSchema.safeParse(body);
  if (!payload.success) return NextResponse.json({ error: "Invalid clothing item." }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const update: { is_favorite?: boolean; is_in_laundry?: boolean } = {};
  if (payload.data.isFavorite !== undefined) update.is_favorite = payload.data.isFavorite;
  if (payload.data.isInLaundry !== undefined) update.is_in_laundry = payload.data.isInLaundry;
  const { data: item, error } = await supabase
    .from("clothing_items")
    .update(update)
    .eq("id", payload.data.id)
    .select("id, is_favorite, is_in_laundry")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "We could not update this item." }, { status: 500 });
  if (!item) return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });

  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const payload = deleteItemSchema.safeParse(body);
  if (!payload.success) return NextResponse.json({ error: "Invalid clothing item." }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: item, error: deleteError } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", payload.data.id)
    .select("image_path")
    .maybeSingle();

  if (deleteError) return NextResponse.json({ error: "We could not remove this item." }, { status: 500 });
  if (!item) return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });

  if (item.image_path) {
    const { error: storageError } = await supabase.storage.from("wardrobe").remove([item.image_path]);
    if (storageError) console.error("[wardrobe/delete] image cleanup failed", { itemId: payload.data.id });
  }

  return NextResponse.json({ success: true });
}
