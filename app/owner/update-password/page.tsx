"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    //ensure there's a session (the /auth/confirm route should set it)
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setErr("Your reset link is missing or expired. Please request a new password reset email.");
      }
      setChecking(false);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const p1 = pw.trim();
    const p2 = pw2.trim();

    if (p1.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (p1 !== p2) {
      setErr("Passwords do not match.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: p1 });

    if (error) {
      setErr(error.message);
      return;
    }

    setOk("Password updated! Redirecting…");
    router.replace("/owner");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="rounded-2xl bg-card shadow-sm border border-transparent p-6 space-y-4">
          <div className="text-center">
            <div className="text-xs font-semibold tracking-wide text-black/70">
              owner portal
            </div>
            <h1 className="mt-2 text-3xl font-semibold font-display text-black/80">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Use the link from your email to set a new password.
            </p>
          </div>

          {checking ? (
            <p className="text-sm text-black/60">Checking reset link…</p>
          ) : (
            <>
              {err && <p className="text-sm text-red-600">{err}</p>}
              {ok && <p className="text-sm text-green-700">{ok}</p>}

              <form onSubmit={onSubmit} className="space-y-3">
                <label className="block">
                  <span className="text-xs text-black/60">New password</span>
                  <input
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-black/60">Confirm new password</span>
                  <input
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl border-2 border-transparent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition"
                  disabled={!!err && err.includes("expired")}
                >
                  Update password
                </button>

                <button
                  type="button"
                  onClick={() => router.replace("/owner/login?next=/owner")}
                  className="w-full rounded-xl border border-black/10 bg-card px-4 py-2 text-sm font-semibold text-black/70 shadow-sm hover:bg-card-muted transition"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
