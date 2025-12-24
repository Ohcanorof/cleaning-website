//temp code to test the email sending (worked)
/*export async function POST(req: Request) {
  const body = await req.json();
  console.log("Reservation received:", body);
  return Response.json({ ok: true });
}
  */

import{Resend} from "resend";

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
        if(!body.fullName || !body.phone || !body.email || !body.address ||!body.serviceName){
            return Response.json(
                {error: "Missing required fields."}, 
                {status: 400}
            );
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
        const subject = `New Reservation: ${body.serviceName} ($${Number(body.servicePrice).toFixed(2)})`;
        const html = `
            <h2>New Reservation</h2>
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
        const {error} = await resend.emails.send({
            from: "Reservations <onboarding@resend.dev>",
            to: ownerEmail,
            replyTo: body.email,
            subject,
            html,
        });

        if(error){
            console.error("Resend error:", error);
            return Response.json({
                error: "Email failed to send!"}, {status: 502}
            );
        }
        return Response.json({ok: true});
    }catch (e){
        return Response.json({
            error: "Invalid request."}, {status: 400}
        );
    }
}

function escapeHtml(input: string){
    return input. replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
