"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Sign-in failed");
        setPending(false);
        return;
      }
      const dest = searchParams.get("from") || "/";
      router.replace(dest.startsWith("/") ? dest : "/");
      router.refresh();
    } catch {
      setError("Network error");
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-green-100 p-3 rounded-xl mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AgriScan</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the access password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-gray-200"
              disabled={pending}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full h-11 rounded-lg font-semibold" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-gray-600 text-sm">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
