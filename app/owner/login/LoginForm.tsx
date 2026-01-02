"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onLogin} className="space-y-4">
      <div className="text-center">
        <div className="text-xs font-semibold tracking-wide text-black/70">
          owner portal
        </div>
        <h1 className="mt-2 text-3xl font-semibold font-display text-black/80">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Use your owner credentials to access the dashboard.
        </p>
      </div>

      <label className="block">
        <span className="text-xs text-black/60">Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      <label className="block">
        <span className="text-xs text-black/60">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        className="w-full rounded-xl border-2 border-transparent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition"
      >
        Log in
      </button>
    </form>
  );
}
