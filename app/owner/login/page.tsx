import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function messageFromError(code?: string) {
  if (!code) return null;
  switch (code) {
    case "invalid_link":
      return "That link is invalid or expired. Please request a new password reset email.";
    case "missing_token":
      return "Missing reset token. Please request a new password reset email.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    next?: string | string[];
    error?: string | string[];
    token_hash?: string | string[];
    type?: string | string[];
    code?: string | string[];
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = first(sp.next) ?? "/owner";
  const error = first(sp.error);
  const banner = messageFromError(error);

  // If Supabase redirects here with token_hash/type or code, forward to /auth/confirm
  const token_hash = first(sp.token_hash);
  const linkType = first(sp.type);
  const code = first(sp.code);

  if (code || (token_hash && linkType)) {
    const params = new URLSearchParams();
    if (code) params.set("code", code);
    if (token_hash) params.set("token_hash", token_hash);
    if (linkType) params.set("type", linkType);
    params.set("next", "/owner/update-password");
    redirect(`/auth/confirm?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="rounded-2xl bg-card shadow-sm border border-transparent p-6 space-y-4">
          {banner && (
            <div className="rounded-xl border border-black/10 bg-card-muted p-3 text-sm text-black/70">
              {banner}
            </div>
          )}
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
