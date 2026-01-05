import { createBrowserClient } from "@supabase/ssr";

export function createClient(){
    /**
     * IMPORTANT:
     * - Only use the Supabase ANON (public) key in the browser.
     * - Never expose the service_role key (or any secret) via NEXT_PUBLIC_ env vars.
     */
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!anon) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
      );
    }

    return createBrowserClient(url, anon);
}