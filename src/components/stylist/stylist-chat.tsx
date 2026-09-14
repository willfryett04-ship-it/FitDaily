"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

const prompts = ["What should I wear for dinner tonight?", "How can I make this look smarter?", "What should I pack for a weekend away?"];

export function StylistChat({ isPremium }: { isPremium: boolean }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi — I’m your Fit Daily stylist. Ask me what to wear, how to style a piece, or what to pack." }]);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = question.trim();
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
      setQuestion(content);
      setMessage(error instanceof Error ? error.message : "Your stylist is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  }

  if (!isPremium) return <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7"><p className="text-sm font-medium text-[#766b61]">PREMIUM FEATURE</p><h2 className="mt-3 text-2xl font-semibold">Your personal stylist is ready when you are.</h2><p className="mt-3 max-w-lg leading-7 text-[#6f655d]">Premium members can ask for styling advice based on the clothes they actually own.</p><Button asChild className="mt-6 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]"><Link href="/premium">Explore Premium</Link></Button></section>;

  return <section className="mt-10 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-5 sm:p-7"><div className="max-h-[30rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "assistant" ? "bg-[#eee8e2] text-[#403830]" : "ml-auto bg-[#302a25] text-white"}`}>{item.content}</div>)}{isSending && <div className="max-w-[85%] rounded-2xl bg-[#eee8e2] px-4 py-3 text-sm text-[#62594f]">Your stylist is thinking…</div>}</div><div className="mt-6 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-full border border-[#d7cec5] px-3 py-1.5 text-left text-xs text-[#544b43] hover:bg-[#f1ece7]">{prompt}</button>)}</div><form onSubmit={send} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="sr-only" htmlFor="stylist-question">Ask your stylist</label><textarea id="stylist-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} rows={2} placeholder="Ask about an outfit, a piece, or an occasion…" className="w-full resize-none rounded-xl border border-[#d7cec5] bg-white px-3 py-2.5 text-sm outline-none ring-[#302a25] focus:ring-2" /><Button type="submit" disabled={!question.trim() || isSending} className="rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">Send</Button></form>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</section>;
}
