import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !subscription?.stripe_customer_id) return NextResponse.json({ error: "We could not find your billing details." }, { status: 404 });

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getAppUrl()}/premium`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (portalError) {
    console.error("[stripe/portal]", portalError);
    return NextResponse.json({ error: "We could not open your billing settings." }, { status: 500 });
  }
}
