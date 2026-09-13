import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  const email = auth?.claims?.email;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in before choosing Premium." }, { status: 401 });

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "Premium checkout is not configured yet." }, { status: 503 });

  try {
    const appUrl = getAppUrl();
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: typeof email === "string" ? email : undefined,
      allow_promotion_codes: true,
      metadata: { supabase_user_id: userId },
      subscription_data: { metadata: { supabase_user_id: userId } },
      success_url: `${appUrl}/premium?checkout=success`,
      cancel_url: `${appUrl}/premium?checkout=cancelled`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout link.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "We could not start secure checkout. Please try again." }, { status: 500 });
  }
}
