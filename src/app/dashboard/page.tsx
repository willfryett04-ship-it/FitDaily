import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { WeatherStyleCard } from "@/components/dashboard/weather-style-card";
import { DailyOutfit } from "@/components/dashboard/daily-outfit";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Your wardrobe" };

type RecentOutfit = {
  title: string;
  occasion: string;
  explanation: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");
  const email = typeof claims.email === "string" ? claims.email : "there";

  const [{ count: wardrobeCount }, { data: recentOutfit }] = await Promise.all([
    supabase.from("clothing_items").select("id", { count: "exact", head: true }),
    supabase
      .from("outfits")
      .select("title, occasion, explanation, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const itemCount = wardrobeCount ?? 0;
  const latestLook = recentOutfit as RecentOutfit | null;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#201d1a] sm:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">fit daily</span>
        <div className="flex flex-wrap items-center justify-end gap-2"><Button asChild variant="outline" className="rounded-xl"><a href="/stylist">AI Stylist</a></Button><Button asChild variant="outline" className="rounded-xl"><a href="/planner">Planner</a></Button><Button asChild variant="outline" className="rounded-xl"><a href="/packing">Packing</a></Button><Button asChild variant="outline" className="rounded-xl"><a href="/palette">Palette</a></Button><Button asChild variant="outline" className="rounded-xl"><a href="/profile">Profile</a></Button><SignOutButton /></div>
      </header>

      <section className="mx-auto max-w-5xl py-16 sm:py-20">
        <p className="text-sm font-medium text-[#766b61]">GOOD MORNING, {email.toUpperCase()}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your wardrobe, made easy.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#6f655d]">Keep the pieces you love in one place, then turn them into looks you’ll feel good wearing.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl bg-[#302a25] p-7 text-white">
            <p className="text-xs font-medium tracking-[0.14em] text-[#d8d0c8]">YOUR WARDROBE</p>
            <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">{itemCount}</p>
            <p className="mt-2 text-[#d8d0c8]">{itemCount === 1 ? "piece ready to style" : "pieces ready to style"}</p>
            <Button asChild className="mt-7 rounded-xl bg-white text-[#302a25] hover:bg-[#f1ece7]">
              <a href="/wardrobe">{itemCount ? "View wardrobe" : "Add your first piece"}</a>
            </Button>
          </article>

          <article className="rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-7">
            <p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">YOUR LATEST LOOK</p>
            {latestLook ? (
              <>
                <p className="mt-6 text-xs font-medium uppercase tracking-wide text-[#766b61]">{latestLook.occasion}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{latestLook.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6f655d]">{latestLook.explanation}</p>
                <Button asChild variant="outline" className="mt-6 rounded-xl"><a href="/outfits">See outfit history</a></Button>
              </>
            ) : (
              <>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Your first look is waiting.</h2>
                <p className="mt-3 text-sm leading-6 text-[#6f655d]">Add a few pieces, then let your AI stylist put them together.</p>
                <Button asChild variant="outline" className="mt-6 rounded-xl"><a href="/outfits">Create an outfit</a></Button>
              </>
            )}
          </article>
        </div>

        <section className="mt-12 rounded-3xl border border-[#e5ddd5] bg-[#eee8e2] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">NEXT STEP</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{itemCount < 3 ? "Add a few more favourites." : "Ask your stylist for a fresh look."}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f655d]">{itemCount < 3 ? "Three or more pieces give Fit Daily more interesting combinations to work with." : "Choose an occasion and get a look made only from what you own."}</p>
          </div>
          <Button asChild className="mt-6 shrink-0 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037] sm:mt-0">
            <a href={itemCount < 3 ? "/wardrobe" : "/outfits"}>{itemCount < 3 ? "Add to wardrobe" : "Create an outfit"}</a>
          </Button>
        </section>
        <WeatherStyleCard />
        <DailyOutfit />
      </section>
    </main>
  );
}
