"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState(""); const [message, setMessage] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setMessage(null); const { error } = await createClient().auth.updateUser({ password }); setSaving(false); setMessage(error ? error.message : "Password updated. You can now sign in with your new password."); }
  return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6"><section className="w-full max-w-md rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-8"><Link href="/" className="text-xl font-semibold">fit daily</Link><h1 className="mt-8 text-3xl font-semibold">Choose a new password</h1><form onSubmit={save} className="mt-6 grid gap-4"><input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password (8+ characters)" className="h-12 rounded-xl border border-[#d7cec5] bg-white px-4" /><Button disabled={saving} className="h-12 rounded-xl bg-[#302a25] text-white">{saving ? "Saving…" : "Update password"}</Button></form>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</section></main>;
}
