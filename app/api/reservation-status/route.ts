import {createClient} from "@/lib/supabase/server";

type Body = {
    id: string;
    status: "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";
};

export async function PATCH(req: Request){
    try{
        const body = (await req.json()) as Body;

        if(!body?.id || !body?.status){
            return Response.json({error: "Missing id or status."}, {status: 400});
        }

        const allowed = new Set(["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"]);
        if(!allowed.has(body.status)){
            return Response.json({error: "Invalid status."}, {status: 400});
        }

        const supabase = await createClient();

        //need to be logged in 
        const{data: claimsData} = await supabase.auth.getClaims();
        const userId = claimsData?.claims ? claimsData.claims.sub : null;
        if(!userId){
            return Response.json({error: "Not authenticated."}, {status: 401});
        }

        //need to be an admin here
        const {data: adminRow, error: adminErr} = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();

        if (adminErr) {
            return Response.json({ error: "Admin check failed." }, { status: 500 });
        }
        
        if (!adminRow) {
            return Response.json({ error: "Not authorized." }, { status: 403 });
        }

        //update teh reservation status
        const {error: updateErr} = await supabase.from("reservations").update({status: body.status}).eq("id", body.id);

        if(updateErr){
            return Response.json({ error: "Failed to update status." }, { status: 500 });
        }
        return Response.json({ok: true});
    }catch{
        return Response.json({ error: "Invalid request." }, { status: 400 });
    }
}

