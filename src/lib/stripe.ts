import Stripe from "stripe";

let client: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe has not been configured yet.");

  client ??= new Stripe(secretKey, { typescript: true });
  return client;
}

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL has not been configured yet.");
  return appUrl.replace(/\/$/, "");
}
