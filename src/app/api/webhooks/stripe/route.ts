import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

type SubscriptionRecord = {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string | null;
};

async function storeSubscription(subscription: Stripe.Subscription, userId?: string) {
  const resolvedUserId = userId ?? subscription.metadata.supabase_user_id;
  if (!resolvedUserId) return;

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const record: SubscriptionRecord = {
    user_id: resolvedUserId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_end: subscription.items.data[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null,
  };
  const { error } = await createAdminClient().from("subscriptions").upsert(record, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (typeof session.subscription === "string" && userId) {
        const subscription = await getStripe().subscriptions.retrieve(session.subscription);
        await storeSubscription(subscription, userId);
      }
    }
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await storeSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("[stripe/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
