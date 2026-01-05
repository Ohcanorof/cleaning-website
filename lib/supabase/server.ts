import {
    createServerClient, type CookieOptions
} from "@supabase/ssr";

import { cookies } from "next/headers";

export async function createClient(){
    //this helper is here because cookies are treated as dynamic/async in Next.js
    const cookieStore = await cookies();

    /**
     * Server-side client also uses the ANON key in this app, relying on RLS policies.
     * If you later add server-only privileged operations, use a server-only env var
     * (NOT NEXT_PUBLIC_) and keep those operations in server routes only.
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

    return createServerClient(url, anon,
        {
            cookies: {
                getAll(){
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet){
                    try{
                        cookiesToSet.forEach(({name, value, options}) => {
                            cookieStore.set(name, value, options as CookieOptions);
                        });
                    }catch{
                        //middleware should handle the refresh
                    }
                },
            },
        }
    );
}
