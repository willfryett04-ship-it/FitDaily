"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

const occasions = ["Uni", "Casual", "Date", "Night out", "Work", "Smart event", "Football match"];
const vibes = ["Relaxed", "Minimal", "Streetwear", "Smart", "Statement"];
const prompts = ["How can I make this look smarter?", "What should I pack for a weekend away?"];

export function StylistChat({ isPremium }: { isPremium: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi — I’m your Style Set stylist. Choose an occasion and vibe, then I’ll create an outfit from your wardrobe." },
  ]);
  const [occasion, setOccasion] = useState("");
  const [vibe, setVibe] = useState("");
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function requestText() {
    return [
      occasion && `I'm going to ${occasion.toLowerCase()}.`,
      vibe && `I want a ${vibe.toLowerCase()} vibe.`,
      question.trim(),
    ].filter(Boolean).join(" ");
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = requestText();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setQuestion("");
    setMessage(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/stylist/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your stylist is unavailable right now.");
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (error) {
      setMessages(messages);
      setQuestion(question);
      setMessage(error instanceof Error ? error.message : "Your stylist is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  }

  if (!isPremium) return <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><p className="text-sm font-medium text-[#766b61]">PREMIUM FEATURE</p><h2 className="mt-3 text-2xl font-semibold">Your personal stylist is ready when you are.</h2><p className="mt-3 max-w-lg leading-7 text-[#6f655d]">Premium members can ask for styling advice based on the clothes they actually own.</p><Button asChild className="mt-6 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]"><Link href="/premium">Explore Premium</Link></Button></section>;

  return <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5 sm:p-7"><form onSubmit={send} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#ece5de]"><div><h2 className="text-lg font-semibold text-[#302a25]">Where are you going?</h2><div className="mt-3 flex flex-wrap gap-2">{occasions.map((item) => <button key={item} type="button" aria-pressed={occasion === item} onClick={() => setOccasion((current) => current === item ? "" : item)} className={`rounded-full border px-3.5 py-2 text-sm transition ${occasion === item ? "border-[#302a25] bg-[#302a25] text-white" : "border-[#d7cec5] text-[#544b43] hover:bg-[#f1ece7]"}`}>{item}</button>)}</div></div><div className="mt-6"><h2 className="text-lg font-semibold text-[#302a25]">What vibe?</h2><div className="mt-3 flex flex-wrap gap-2">{vibes.map((item) => <button key={item} type="button" aria-pressed={vibe === item} onClick={() => setVibe((current) => current === item ? "" : item)} className={`rounded-full border px-3.5 py-2 text-sm transition ${vibe === item ? "border-[#302a25] bg-[#302a25] text-white" : "border-[#d7cec5] text-[#544b43] hover:bg-[#f1ece7]"}`}>{item}</button>)}</div></div><label className="mt-6 block text-sm font-medium text-[#403830]" htmlFor="stylist-question">Anything else?</label><textarea id="stylist-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} rows={2} placeholder="I don't want to wear jeans today..." className="mt-2 w-full resize-none rounded-xl border border-[#d7cec5] bg-[#fcfbf9] px-3 py-2.5 text-sm outline-none ring-[#302a25] focus:ring-2" /><Button type="submit" disabled={!requestText() || isSending} className="mt-4 w-full rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037] sm:w-auto">{isSending ? "Creating your Style Set…" : "Create my Style Set →"}</Button></form><div className="mt-7 max-h-[30rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "assistant" ? "bg-[#eee8e2] text-[#403830]" : "ml-auto bg-[#302a25] text-white"}`}>{item.content}</div>)}{isSending && <div className="max-w-[85%] rounded-2xl bg-[#eee8e2] px-4 py-3 text-sm text-[#62594f]">Your stylist is thinking…</div>}</div><div className="mt-6 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-full border border-[#d7cec5] px-3 py-1.5 text-left text-xs text-[#544b43] hover:bg-[#f1ece7]">{prompt}</button>)}</div>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</section>;
}
