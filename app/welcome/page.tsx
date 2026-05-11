"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Sprout, ScanLine, Sun } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    const target = from && from.startsWith("/") ? `/login?from=${encodeURIComponent(from)}` : "/login";
    const timer = window.setTimeout(() => {
      router.replace(target);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-800 to-green-950 px-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-400/20 blur-2xl animate-pulse" />
        <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-lime-300/15 blur-2xl animate-pulse" />
        <div className="absolute bottom-6 left-1/3 h-40 w-40 rounded-full bg-green-300/20 blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 grid grid-cols-2 gap-4 text-emerald-100">
          <span className="inline-flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white/10">
            <Leaf className="h-7 w-7" />
          </span>
          <span className="inline-flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white/10 [animation-delay:120ms]">
            <Sprout className="h-7 w-7" />
          </span>
          <span className="inline-flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white/10 [animation-delay:240ms]">
            <ScanLine className="h-7 w-7" />
          </span>
          <span className="inline-flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-white/10 [animation-delay:360ms]">
            <Sun className="h-7 w-7" />
          </span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-50 sm:text-5xl">AgriScan</h1>
        <p className="mt-3 max-w-sm text-sm font-medium text-emerald-100/90 sm:text-base">
          Smart crop monitoring for healthier fields.
        </p>

        <div className="mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-full origin-left animate-[grow_2s_linear_forwards] rounded-full bg-emerald-300" />
        </div>
      </div>
    </div>
  );
}
