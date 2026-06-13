import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

//func to ret json errors
function jsonError(status: number, message: string){
    return NextResponse.json({ok: false, error: message}, {status});
}

export async function GET(req: NextRequest){
    const expectedSecret = process.env.HEALTH_CHECK_SECRET;
    const providedSecret = req.headers.get("x-health-check-secret");

    if(!expectedSecret){
        return jsonError(500, "The health check secret is not configured!");
    }

    if(providedSecret !== expectedSecret){
        return jsonError(401, "Unauthorized!!!");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if(!supabaseUrl || !secretKey){
        return jsonError(500, "Supabse env vars are not configured!!!");
    }

    const supabase = createClient(supabaseUrl, secretKey, {auth: {persistSession: false,},});
    const checkedAt = new Date().toISOString();

    const {error} = await supabase.from("health_checks").upsert({id: "supabase-keepalive", last_checked_at: checkedAt, source: "github-actions",});

    if(error){
        return jsonError(500, error.message);
    }

    return NextResponse.json({ok: true, checkedAt,});


}

