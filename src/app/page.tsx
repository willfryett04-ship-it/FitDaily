import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10 lg:px-16">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Style Set</span>
        <Button asChild variant="outline" className="rounded-full bg-white"><Link href="/login">Sign in</Link></Button>
      </nav>
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="mb-5 rounded-full border border-[#d9d0c7] bg-white px-4 py-2 text-sm font-medium text-[#72675d]">Your AI personal stylist</p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">Get dressed with confidence.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#665d55]">A simpler way to organize your wardrobe, discover what works together, and get a daily look that feels like you.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-[#302a25] px-7 text-white hover:bg-[#4a4037]"><Link href="/sign-up">Build my wardrobe</Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-[#cfc5bb] bg-transparent px-7"><Link href="/login">See how it works</Link></Button>
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between border-t border-[#e6dfd8] pt-5 text-sm text-[#83776c]">
        <span>Never wonder what to wear.</span><span>Made for your real life.</span>
      </footer>
    </main>
  );
}
