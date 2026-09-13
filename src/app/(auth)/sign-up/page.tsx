import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return <><h1 className="text-3xl font-semibold tracking-tight">Make your wardrobe work harder</h1><p className="mb-8 mt-3 text-[#6f655d]">Create an account to start building your digital wardrobe.</p><AuthForm mode="sign-up" /></>;
}
