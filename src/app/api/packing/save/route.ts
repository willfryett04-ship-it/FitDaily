import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ destination: z.string().trim().min(2).max(80), days: z.number().int().min(1).max(21), weather: z.string().max(20), plans: z.string().trim().min(2).max(160), content: z.object({ summary: z.string(), sections: z.array(z.object({ category: z.string(), items: z.array(z.string()), note: z.string() })) }) });
export async function POST(request: NextRequest) { const payload = schema.safeParse(await request.json().catch(() => null)); if (!payload.success) return NextResponse.json({ error: "Packing list details are not valid." }, { status: 400 }); const supabase = await createClient(); const { data: auth } = await supabase.auth.getClaims(); const userId = auth?.claims?.sub; if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 }); const { error } = await supabase.from("packing_lists").insert({ user_id: userId, ...payload.data }); if (error) return NextResponse.json({ error: "We could not save your list." }, { status: 500 }); return NextResponse.json({ success: true }); }
