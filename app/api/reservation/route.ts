//temp code to test the email sending (worked)
/*export async function POST(req: Request) {
  const body = await req.json();
  console.log("Reservation received:", body);
  return Response.json({ ok: true });
}
  */

import{Resend} from "resend";
import { createClient } from "@/lib/supabase/server";

type ReservationPayload = {
    //reservation info
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDescription?: string;
    requestedDate?: string;
    timeWindow?: string;
    notes?: string;

    //user info
    fullName: string;
    phone: string;
    email: string;
    address: string;
    website?: string; //honeypot for da bots
}

//email route four reservations
export async function POST(req: Request){
    try{
        const body = (await req.json()) as ReservationPayload;

        //honeypot for bots
        if (body.website) return Response.json({
            ok: true
        });

        //actual required checks for the user input
        if(!body.serviceId || !body.serviceName ||typeof body.servicePrice !== "number" || !body.fullName || !body.phone || !body.email || !body.address){
            return Response.json(
                {error: "Missing required fields."}, 
                {status: 400}
            );
        }

        //generating the confirmation codde
        const confirmationCode = makeCode(8);

        //save it to Supabase
        const supabase = await createClient();
        const {error: insertError} = await supabase.from("reservations").insert({
            status: "NEW",
            confirmation_code: confirmationCode,
            service_id: body.serviceId,
            service_name: body.serviceName,
            service_price: body.servicePrice,
            service_description: body.serviceDescription ?? null,

            requested_date: body.requestedDate ? body.requestedDate : null,
            time_window: body.timeWindow ?? null,
            notes: body.notes ?? null,

            full_name: body.fullName,
            phone: body.phone,
            email: body.email,
            address: body.address,
        });

        if (insertError){
            console.error("Database insert error:", insertError);
            return Response.json({error: "Failed to save the reservation."}, { status: 500 });
        }

        const resendKey = process.env.RESEND_API_KEY;
        const ownerEmail = process.env.OWNER_EMAIL;
        
        //required checks for api and owners email
        if(!resendKey || !ownerEmail){
            return Response.json(
                {error: "Missing RESEND_API_KEY or OWNER_EMAIL."},
                {status: 500}
            );
        }

        const resend = new Resend(resendKey);
        //will alwyas be the subject line in emails
        const subject = `New Reservation: ${body.serviceName} ($${Number(body.servicePrice).toFixed(2)})`;
        //the actual email body
        const html = `
            <h2>New Reservation</h2>
            <p><strong>Confirmation Code:</strong> ${escapeHtml(confirmationCode)}</p>
            <hr/>
            <p><strong>Service:</strong> ${escapeHtml(body.serviceName)}</p>
            <p><strong>Price:</strong> $${Number(body.servicePrice).toFixed(2)}</p>
            <p><strong>Description:</strong> ${escapeHtml(body.serviceDescription ?? "")}</p>
            <hr/>
            <p><strong>Requested Date:</strong> ${escapeHtml(body.requestedDate ?? "")}</p>
            <p><strong>Time Window:</strong> ${escapeHtml(body.timeWindow ?? "")}</p>
            <p><strong>Notes:</strong><br/>${escapeHtml(body.notes ?? "").replace(/\n/g, "<br/>")}</p>
            <hr/>
            <h3>Customer Info</h3>
            <p><strong>Name:</strong> ${escapeHtml(body.fullName)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(body.phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
            <p><strong>Address:</strong> ${escapeHtml(body.address)}</p>
            `;

        const {error: emailError} = await resend.emails.send({
            from: "Reservations <onboarding@resend.dev>",
            to: ownerEmail,
            replyTo: body.email,
            subject,
            html,
        });

        if(emailError){
            //reservation is already saved, so ret success w/ a warning
            console.error("Resend error:", emailError);
            return Response.json(
                {ok: true, confirmationCode, warning: "Saved to DB, but email failed to send." },
                { status: 200 }
            );
        }

        return Response.json({ok: true, confirmationCode});
    }catch (e){
        return Response.json({error: "Invalid request."}, {status: 400});
    }
}

function makeCode(len: number){
    const chars ="ABCDEFGHJKLMNPQRSTUVWXYZ23456789" //will help avoid the O/0 and I/1 confusion
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function escapeHtml(input: string){
    return input. replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
