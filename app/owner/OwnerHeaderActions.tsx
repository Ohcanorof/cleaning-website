"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";

export default function OwnerHeaderActions(){
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout(){
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/owner/login?next=/owner");
        router.refresh();
    }

    //logout button
    return( <button onClick={logout} disabled={loading} 
        className="rounded-lg border-2 border-black px-4 py-2 text-xs font-semibold text-black/70 hover:bg-black hover:text-white transition disabled:opacity-50"> 
        {loading ? "Signing out..." : "Log out"} </button>);

}