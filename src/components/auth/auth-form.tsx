"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const supabase = createClient();

    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignUp) {
      setMessage("Check your inbox to confirm your email, then come back to sign in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
      <label className="block space-y-2 text-sm font-medium">
        <span>Email address</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-[#d7cec5] bg-white px-4 outline-none ring-[#302a25] focus:ring-2" />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        <span>Password</span>
        <input name="password" type="password" required minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="At least 8 characters" className="h-12 w-full rounded-xl border border-[#d7cec5] bg-white px-4 outline-none ring-[#302a25] focus:ring-2" />
      </label>
      {message && <p role="status" className="rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}
      <Button type="submit" size="lg" disabled={isLoading} className="w-full rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">
        {isLoading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-[#6f655d]">
        {isSignUp ? "Already have an account?" : "New to Fit Daily?"}{" "}
        <Link href={isSignUp ? "/login" : "/sign-up"} className="font-semibold text-[#302a25] underline underline-offset-4">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
