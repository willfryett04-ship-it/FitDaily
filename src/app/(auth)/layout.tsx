import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12 text-[#201d1a]">
      <section className="w-full max-w-md rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-8 shadow-sm sm:p-10">
        <Link href="/" className="mb-9 inline-block text-xl font-semibold tracking-tight">Style Set</Link>
        {children}
      </section>
    </main>
  );
}
