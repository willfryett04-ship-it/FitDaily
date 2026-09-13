"use client";

import { FormEvent, useState } from "react";
import { CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Weather = { location: string; temperature: number; precipitation: number; tip: string };

export function WeatherStyleCard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkWeather(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true); setMessage(null);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not check the weather.");
      setWeather(result);
    } catch (error) {
      setWeather(null);
      setMessage(error instanceof Error ? error.message : "We could not check the weather.");
    } finally { setIsLoading(false); }
  }

  return <section className="mt-4 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><div className="flex items-center gap-3"><span className="rounded-2xl bg-[#eee8e2] p-3"><CloudSun className="size-5 text-[#62594f]" /></span><div><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">DRESS FOR THE WEATHER</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">A little weather wisdom.</h2></div></div><form onSubmit={checkWeather} className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={city} onChange={(event) => setCity(event.target.value)} required minLength={2} placeholder="Enter your city" className="h-11 flex-1 rounded-xl border border-[#d7cec5] bg-white px-3" /><Button disabled={isLoading} variant="outline" className="h-11 rounded-xl">{isLoading ? "Checking…" : "Check weather"}</Button></form>{weather && <div className="mt-5 rounded-2xl bg-[#f1ece6] p-4"><p className="font-semibold">{weather.location} · {weather.temperature}°C</p><p className="mt-2 text-sm leading-6 text-[#62594f]">{weather.tip}</p></div>}{message && <p role="status" className="mt-4 rounded-xl bg-[#f2e5e2] p-3 text-sm text-[#74443c]">{message}</p>}</section>;
}
