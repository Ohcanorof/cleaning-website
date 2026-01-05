"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setErr(error.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  async function onForgotPassword() {
    setErr(null);
    setInfo(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErr("Enter your email first, then click “Forgot password”.");
      return;
    }

    try {
      setSendingReset(true);
      const supabase = createClient();

      // Send reset link to email. After clicking, Supabase will redirect to /auth/confirm,
      // which verifies the token and then routes to /owner/update-password.
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
        redirectTo: "https://pattyshousecleaning.vercel.app/auth/confirm?next=/owner/update-password",
      });

      if (error) {
        setErr(error.message);
        return;
      }

      setInfo("Password reset email sent. Check your inbox (and spam).");
    } finally {
      setSendingReset(false);
    }
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
      {info && <p className="text-sm text-green-700">{info}</p>}

      <button
        type="submit"
        className="w-full rounded-xl border-2 border-transparent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition"
      >
        Log in
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        disabled={sendingReset}
        className="w-full rounded-xl border border-black/10 bg-card px-4 py-2 text-sm font-semibold text-black/70 shadow-sm hover:bg-card-muted transition disabled:opacity-50"
      >
        {sendingReset ? "Sending reset email..." : "Forgot password?"}
      </button>
    </form>
  );
}
