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
        className="rounded-xl border-2 border-transparent bg-card px-4 py-2 text-sm font-semibold text-black/70 shadow-sm hover:bg-card-muted transition disabled:opacity-50"> 
        {loading ? "Signing out..." : "Log out"} </button>);

}