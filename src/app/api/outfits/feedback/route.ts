import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ outfitId: z.string().uuid(), feedback: z.enum(["loved", "not_for_me"]).nullable() });

export async function PATCH(request: NextRequest) {
  const payload = schema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Choose valid outfit feedback." }, { status: 400 });
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getClaims(); const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { data, error } = await supabase.from("outfits").update({ feedback: payload.data.feedback }).eq("id", payload.data.outfitId).eq("user_id", userId).select("id, feedback").maybeSingle();
  if (error) return NextResponse.json({ error: "We could not save your feedback." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "That outfit is no longer available." }, { status: 404 });
  return NextResponse.json(data);
}
