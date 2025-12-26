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
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReservationPayload;

    //honeypot
    if (body.website) return Response.json({ ok: true });

    //required fields
    if (
      !body.fullName ||
      !body.phone ||
      !body.email ||
      !body.address ||
      !body.serviceId ||
      !body.serviceName
    ) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;
    const fromEmail = process.env.RESEND_FROM || "Reservations <onboarding@resend.dev>";

    if (!resendKey || !ownerEmail) {
      return Response.json(
        { error: "Missing RESEND_API_KEY or OWNER_EMAIL." },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    //create a reservation confirmation code
    const confirmationCode = await generateUniqueCode(supabase);

    //1) Insert into DB
    //Make sure your reservations table includes confirmation_code
    const { error: insertErr } = await supabase.from("reservations").insert({
      status: "NEW",
      confirmation_code: confirmationCode,

      service_id: body.serviceId,
      service_name: body.serviceName,
      service_price: body.servicePrice,
      service_description: body.serviceDescription ?? null,

      requested_date: body.requestedDate || null,
      time_window: body.timeWindow || null,
      notes: body.notes || null,

      full_name: body.fullName,
      phone: body.phone,
      email: body.email,
      address: body.address,
    });

    if (insertErr) {
      console.error("Supabase insert error:", insertErr);
      return Response.json({ error: "Failed to save reservation." }, { status: 500 });
    }

    const resend = new Resend(resendKey);

    //2) Email owner
    const ownerSubject = `New Reservation: ${body.serviceName} ($${Number(body.servicePrice).toFixed(
      2
    )}) [${confirmationCode}]`;

    const ownerHtml = `
      <h2>New Reservation</h2>
      <p><strong>Confirmation Code:</strong> ${escapeHtml(confirmationCode)}</p>
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

    const ownerSend = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      replyTo: body.email,
      subject: ownerSubject,
      html: ownerHtml,
    });

    if (ownerSend.error) {
      console.error("Resend owner email error:", ownerSend.error);
      return Response.json({ error: "Owner email failed to send." }, { status: 502 });
    }

    //3) Email customer (receipt)
    const customerSubject = `Reservation received: ${body.serviceName} [${confirmationCode}]`;

    const customerHtml = `
      <h2>We received your reservation request ✅</h2>
      <p>Thanks, ${escapeHtml(body.fullName)}!</p>

      <p><strong>Confirmation Code:</strong> ${escapeHtml(confirmationCode)}</p>

      <hr/>
      <p><strong>Service:</strong> ${escapeHtml(body.serviceName)}</p>
      <p><strong>Estimated Price:</strong> $${Number(body.servicePrice).toFixed(2)}</p>
      <p><strong>Requested Date:</strong> ${escapeHtml(body.requestedDate ?? "(not provided)")}</p>
      <p><strong>Time Window:</strong> ${escapeHtml(body.timeWindow ?? "(not provided)")}</p>
      ${body.notes ? `<p><strong>Your Notes:</strong><br/>${escapeHtml(body.notes).replace(/\n/g,"<br/>")}</p>` : ""}

      <hr/>
      <p><strong>Payment:</strong> Cash (for now)</p>
      <p>
        The owner will call/text to confirm your reservation about 1 day in advance.
        If you need to update anything, reply to this email and include your confirmation code.
      </p>
    `;

    const customerSend = await resend.emails.send({
      from: fromEmail,
      to: body.email,
      replyTo: ownerEmail, //customer replies go to owner
      subject: customerSubject,
      html: customerHtml,
    });

    //If customer email fails, we still keep the reservation + owner email succeeded.
    if (customerSend.error) {
      console.error("Resend customer email error:", customerSend.error);
      return Response.json({
        ok: true,
        confirmationCode,
        customerEmailSent: false,
      });
    }

    return Response.json({
      ok: true,
      confirmationCode,
      customerEmailSent: true,
    });
  } catch (e) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

function makeCode(){
    const chars ="ABCDEFGHJKLMNPQRSTUVWXYZ23456789" //will help avoid the O/0 and I/1 confusion
    let out = "";
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

async function generateUniqueCode(supabase: any){
      for (let i = 0; i < 8; i++) {
    const code = makeCode();
    const { data, error } = await supabase
      .from("reservations")
      .select("id")
      .eq("confirmation_code", code)
      .maybeSingle();

    if (error) {
      //If this errors, we can still attempt insert and let unique index enforce
      return code;
    }

    if (!data) return code;
  }

  //a fallback
  return makeCode() + makeCode();
}

function escapeHtml(input: string){
    return input. replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
