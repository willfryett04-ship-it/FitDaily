import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({ outfitId: z.string().uuid(), wornOn: z.string().date() });
const removeSchema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest) {
  const payload = createSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Choose an outfit and a valid date." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { data: outfit } = await supabase.from("outfits").select("id").eq("id", payload.data.outfitId).maybeSingle();
  if (!outfit) return NextResponse.json({ error: "That outfit is not available." }, { status: 404 });
  const { data: wear, error } = await supabase.from("outfit_wears").upsert({ user_id: userId, outfit_id: outfit.id, worn_on: payload.data.wornOn }, { onConflict: "user_id,outfit_id,worn_on" }).select("id, outfit_id, worn_on").single();
  if (error || !wear) return NextResponse.json({ error: "We could not save that wear." }, { status: 500 });
  return NextResponse.json(wear);
}

export async function DELETE(request: NextRequest) {
  const payload = removeSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid wear record." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { error } = await supabase.from("outfit_wears").delete().eq("id", payload.data.id);
  if (error) return NextResponse.json({ error: "We could not remove that wear." }, { status: 500 });
  return NextResponse.json({ success: true });
}
