import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reminderSchema = z.object({ enabled: z.boolean(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) });

export async function PATCH(request: NextRequest) {
  const payload = reminderSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Choose a valid reminder time." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { error } = await supabase.from("profiles").upsert({ user_id: userId, reminder_enabled: payload.data.enabled, reminder_time: payload.data.time, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "We could not save your reminder." }, { status: 500 });
  return NextResponse.json({ success: true });
}
