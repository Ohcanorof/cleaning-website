import {
    createServerClient, type CookieOptions
} from "@supabase/ssr";

import { cookies } from "next/headers";

export async function createClient(){
    //this helper is here because cookies are treated as dynamic/async in Next.js
    const cookieStore = await cookies();

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
