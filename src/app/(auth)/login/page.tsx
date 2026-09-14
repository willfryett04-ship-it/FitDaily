import { AuthForm } from "@/components/auth/auth-form";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/dashboard");
  return <><h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1><p className="mb-8 mt-3 text-[#6f655d]">Sign in to see what to wear today.</p><AuthForm mode="sign-in" /></>;
}
