"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
type Outfit = { title: string; explanation: string; items: Array<{ id: string; name: string }>; style_score: number; score_breakdown: { colour: number; proportions: number; occasion: number; weather: number; personal_style: number }; score_explanation: string };
type Weather = { location: string; temperature: number; precipitation: number; tip: string };
export function DailyOutfit() {
  const [outfit, setOutfit] = useState<Outfit | null>(null); const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); const [city, setCity] = useState(""); const [weather, setWeather] = useState<Weather | null>(null);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(null);
    try {
      let currentWeather: Weather | null = null;
      if (city.trim()) { const weatherResponse = await fetch(`/api/weather?city=${encodeURIComponent(city)}`); const weatherResult = await weatherResponse.json(); if (!weatherResponse.ok) throw new Error(weatherResult.error || "We could not check the weather."); currentWeather = weatherResult; setWeather(currentWeather); }
      const response = await fetch("/api/outfits/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ occasion: "casual", ...(currentWeather ? { weather: currentWeather } : {}) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "We could not create today’s look."); setOutfit(result);
    } catch (error) { setMessage(error instanceof Error ? error.message : "We could not create today’s look."); } finally { setLoading(false); }
  }
  return <section className="mt-4 rounded-3xl bg-[#302a25] p-7 text-white"><p className="text-xs font-medium tracking-[0.14em] text-[#d8d0c8]">TODAY’S STYLE SET</p>{outfit ? <><h2 className="mt-3 text-2xl font-semibold">{outfit.title}</h2><p className="mt-2 text-sm leading-6 text-[#d8d0c8]">{outfit.explanation}</p><p className="mt-4 text-sm">{outfit.items.map((item) => item.name).join(" · ")}</p><div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-3xl font-semibold">Style Score — {outfit.style_score}</p><p className="mt-2 text-xs text-[#d8d0c8]">Colour {outfit.score_breakdown.colour}/10 · Proportions {outfit.score_breakdown.proportions}/10 · Occasion {outfit.score_breakdown.occasion}/10 · Weather {outfit.score_breakdown.weather}/10 · Personal style {outfit.score_breakdown.personal_style}/10</p><p className="mt-3 text-sm leading-6">{outfit.score_explanation}</p></div>{weather && <p className="mt-3 text-xs text-[#d8d0c8]">Made for {weather.location} · {weather.temperature}°C</p>}</> : <><h2 className="mt-3 text-2xl font-semibold">Never wonder what to wear.</h2><p className="mt-2 text-sm leading-6 text-[#d8d0c8]">Add your city for a look adjusted to the weather, or leave it blank for a relaxed everyday outfit.</p><form onSubmit={create} className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Your city (optional)" className="h-11 flex-1 rounded-xl border border-white/25 bg-white/10 px-3 text-sm placeholder:text-[#d8d0c8]" /><Button type="submit" disabled={loading} className="h-11 rounded-xl bg-white text-[#302a25] hover:bg-[#f1ece7]">{loading ? "Styling…" : "Create today’s Style Set"}</Button></form></>}{message && <p role="status" className="mt-4 rounded-xl bg-[#5b3d38] p-3 text-sm">{message}</p>}</section>;
}
