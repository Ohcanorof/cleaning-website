import {createServerClient} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest){
    let response = NextResponse.next({request});

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!anon) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
      );
    }

    const supabase = createServerClient(url, anon,
        {
            cookies: {
                getAll(){
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet){
                    //the refreshed cookies are written to request and response
                    cookiesToSet.forEach(({name, value, options}) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    //using getClaims instead of getSession as recomended by Supabase for the server-side protections
    await supabase.auth.getClaims();
    return response;
}