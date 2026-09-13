import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const planSchema = z.object({ outfitId: z.string().uuid(), plannedFor: z.string().date() });
const removeSchema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest) {
  const payload = planSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Choose an outfit and a valid date." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: outfit } = await supabase.from("outfits").select("id").eq("id", payload.data.outfitId).maybeSingle();
  if (!outfit) return NextResponse.json({ error: "That saved outfit is not available." }, { status: 404 });

  const { data: planned, error } = await supabase
    .from("planned_outfits")
    .upsert({ user_id: userId, outfit_id: outfit.id, planned_for: payload.data.plannedFor }, { onConflict: "user_id,planned_for" })
    .select("id, outfit_id, planned_for")
    .single();
  if (error || !planned) return NextResponse.json({ error: "We could not save your plan." }, { status: 500 });
  return NextResponse.json(planned);
}

export async function DELETE(request: NextRequest) {
  const payload = removeSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid planned outfit." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { data: deleted, error } = await supabase.from("planned_outfits").delete().eq("id", payload.data.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "We could not remove this plan." }, { status: 500 });
  if (!deleted) return NextResponse.json({ error: "This planned outfit is no longer available." }, { status: 404 });
  return NextResponse.json({ success: true });
}
