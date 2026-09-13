import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <><h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1><p className="mb-8 mt-3 text-[#6f655d]">Sign in to see what to wear today.</p><AuthForm mode="sign-in" /></>;
}
