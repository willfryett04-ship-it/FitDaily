import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const citySchema = z.string().trim().min(2).max(100);

function stylingTip(temperature: number, weatherCode: number) {
  if (weatherCode >= 51) return "Take a rain layer and choose shoes you do not mind getting wet.";
  if (temperature <= 5) return "Go for warm layers, an outerwear piece, and closed shoes.";
  if (temperature <= 13) return "A light jacket or knit will make this look more comfortable.";
  if (temperature >= 24) return "Keep it breathable and light—linen, cotton, or an easy dress work well.";
  return "A balanced, easy layer is all you need today.";
}

export async function GET(request: NextRequest) {
  const city = citySchema.safeParse(request.nextUrl.searchParams.get("city"));
  if (!city.success) return NextResponse.json({ error: "Enter a city name." }, { status: 400 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodingUrl.search = new URLSearchParams({ name: city.data, count: "1", language: "en", format: "json" }).toString();
    const locationResponse = await fetch(geocodingUrl, { signal: AbortSignal.timeout(6000) });
    const locationData = await locationResponse.json() as { results?: Array<{ name: string; country?: string; latitude: number; longitude: number }> };
    const location = locationData.results?.[0];
    if (!location) return NextResponse.json({ error: "We could not find that city." }, { status: 404 });

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,precipitation,weather_code", temperature_unit: "celsius", timezone: "auto" }).toString();
    const forecastResponse = await fetch(forecastUrl, { signal: AbortSignal.timeout(6000) });
    const forecast = await forecastResponse.json() as { current?: { temperature_2m?: number; precipitation?: number; weather_code?: number } };
    const current = forecast.current;
    if (typeof current?.temperature_2m !== "number" || typeof current.weather_code !== "number") throw new Error("Incomplete forecast");
    return NextResponse.json({ location: [location.name, location.country].filter(Boolean).join(", "), temperature: Math.round(current.temperature_2m), precipitation: current.precipitation ?? 0, tip: stylingTip(current.temperature_2m, current.weather_code) });
  } catch {
    return NextResponse.json({ error: "Weather is unavailable right now. Try again shortly." }, { status: 502 });
  }
}
