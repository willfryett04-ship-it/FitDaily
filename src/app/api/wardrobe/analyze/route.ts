import OpenAI from "openai";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({ imagePath: z.string().min(1).max(500) });
const analysisSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.enum(["top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"]),
  color: z.string().max(40),
  seasons: z.array(z.enum(["spring", "summer", "autumn", "winter"])).max(4),
  occasions: z.array(z.enum(["casual", "work", "evening", "formal", "active"])).max(5),
  description: z.string().max(240),
});

const analysisJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    category: { type: "string", enum: ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"] },
    color: { type: "string" },
    seasons: { type: "array", items: { type: "string", enum: ["spring", "summer", "autumn", "winter"] } },
    occasions: { type: "array", items: { type: "string", enum: ["casual", "work", "evening", "formal", "active"] } },
    description: { type: "string" },
  },
  required: ["name", "category", "color", "seasons", "occasions", "description"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI styling is not configured." }, { status: 503 });
  const payload = requestSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: "Invalid image request." }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!payload.data.imagePath.startsWith(`${userId}/`)) return NextResponse.json({ error: "Image access denied." }, { status: 403 });

  const { data: signed, error: signedError } = await supabase.storage.from("wardrobe").createSignedUrl(payload.data.imagePath, 60);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "We could not access that photo." }, { status: 404 });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        { role: "developer", content: "You are a careful wardrobe assistant. Identify only the single main clothing item in the photo. Never infer a person's identity, body details, or sensitive traits. If the photo is unclear, use broad, conservative labels." },
        { role: "user", content: [{ type: "input_text", text: "Analyse this wardrobe item and return the requested fields." }, { type: "input_image", image_url: signed.signedUrl, detail: "low" }] },
      ],
      text: { format: { type: "json_schema", name: "clothing_analysis", strict: true, schema: analysisJsonSchema } },
    });
    const analysis = analysisSchema.safeParse(JSON.parse(response.output_text));
    if (!analysis.success) return NextResponse.json({ error: "The analysis was incomplete. Try a clearer photo." }, { status: 422 });
    return NextResponse.json(analysis.data);
  } catch {
    return NextResponse.json({ error: "The AI analysis is unavailable right now. You can still add the item manually." }, { status: 502 });
  }
}
