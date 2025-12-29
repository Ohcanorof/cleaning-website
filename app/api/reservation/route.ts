//temp code to test the email sending (worked)
/*export async function POST(req: Request) {
  const body = await req.json();
  console.log("Reservation received:", body);
  return Response.json({ ok: true });
}
  */

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

type ReservationPayload = {
  //reservation info
  serviceId: string;
  serviceName: string;
  serviceMinPrice: number;
  serviceMaxPrice: number;
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
};

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

    //for security normalize + validate inputs (server-side)
    const fullName = clampString(body.fullName, 80);
    const email = clampString(body.email, 254).toLowerCase();
    const address = clampString(body.address, 200);

    const notes = clampString(body.notes, 1000);
    const timeWindow = clampString(body.timeWindow, 80);

    const serviceId = clampString(body.serviceId, 60);
    const serviceName = clampString(body.serviceName, 80);
    const serviceDescription = clampString(body.serviceDescription, 500);

    const phoneNormalized = normalizePhone(clampString(body.phone, 20));

    const minPrice = parseMoney(body.serviceMinPrice);
    const maxPrice = parseMoney(body.serviceMaxPrice);

    //date is optional
    const requestedDateRaw = clampString(body.requestedDate, 10);
    const requestedDate = requestedDateRaw && isISODate(requestedDateRaw) ? requestedDateRaw : "";


    if (!fullName || fullName.length < 2) {
      return Response.json({ error: "Name is too short." }, { status: 400 });
    }
    if (!phoneNormalized) {
      return Response.json({ error: "Phone number looks invalid." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Email looks invalid." }, { status: 400 });
    }
    if (!address || address.length < 5) {
      return Response.json({ error: "Address is too short." }, { status: 400 });
    }
    if (!serviceId) {
      return Response.json({ error: "Invalid service." }, { status: 400 });
    }
    if (!serviceName) {
      return Response.json({ error: "Invalid service name." }, { status: 400 });
    }

    // price range must be valid
    if (minPrice === null || maxPrice === null || minPrice > maxPrice) {
      return Response.json({ error: "Invalid estimated price range." }, { status: 400 });
    }

    // if they provided a date but it wasn't valid, reject (optional strictness)
    if (requestedDateRaw && !requestedDate) {
      return Response.json({ error: "Invalid date format (use YYYY-MM-DD)." }, { status: 400 });
    }
    //end of user validation

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
      service_min_price: body.serviceMinPrice,
      service_max_price: body.serviceMaxPrice,
      service_price: null,
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

    const min = Number(body.serviceMinPrice);
    const max = Number(body.serviceMaxPrice);
    const estRange =
      Number.isFinite(min) && Number.isFinite(max)
        ? `$${min.toFixed(0)}–$${max.toFixed(0)}`
        : "(not provided)";

    //2) Email owner
    const ownerSubject = `New Quote Request: ${body.serviceName} (Est. ${estRange}) [${confirmationCode}]`;

    const ownerHtml = `
      <h2>New Quote Request</h2>
      <p><strong>Confirmation Code:</strong> ${escapeHtml(confirmationCode)}</p>
      <p><strong>Service:</strong> ${escapeHtml(body.serviceName)}</p>
      <p><strong>Estimated Range:</strong> ${escapeHtml(estRange)}</p>
      <p><strong>Final Price:</strong> Determined after in-person quote.</p>
      <p><strong>Description:</strong> ${escapeHtml(body.serviceDescription ?? "")}</p>
      <hr/>
      <p><strong>Preferred Quote Date:</strong> ${escapeHtml(body.requestedDate ?? "")}</p>
      <p><strong>Preferred Quote Window:</strong> ${escapeHtml(body.timeWindow ?? "")}</p>
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
      replyTo: body.email, // owner can reply to customer quickly
      subject: ownerSubject,
      html: ownerHtml,
    });

    if (ownerSend.error) {
      console.error("Resend owner email error:", ownerSend.error);
      return Response.json({ error: "Owner email failed to send." }, { status: 502 });
    }

    //3) Email customer (receipt)
    const customerSubject = `Quote request received: ${body.serviceName} [${confirmationCode}]`;

    const customerHtml = `
      <h2>We received your quote request ✅</h2>
      <p>Thanks, ${escapeHtml(body.fullName)}!</p>

      <p><strong>Confirmation Code:</strong> ${escapeHtml(confirmationCode)}</p>

      <hr/>
      <p><strong>Service:</strong> ${escapeHtml(body.serviceName)}</p>
      <p><strong>Estimated Range:</strong> ${escapeHtml(estRange)}</p>
      <p><strong>Final Price:</strong> We’ll confirm a final price after an in-person walkthrough/quote.</p>
      <p><strong>Preferred Quote Date:</strong> ${escapeHtml(body.requestedDate ?? "(not provided)")}</p>
      <p><strong>Preferred Quote Window:</strong> ${escapeHtml(body.timeWindow ?? "(not provided)")}</p>

      <hr/>
      <p>If you need to add details or change availability, just reply to this email or text/call the number on the website.</p>
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
  } catch (err) {
    console.error("Reservation API error:", err);
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

async function generateUniqueCode(supabase: any) {
  function makeCode() {
    return Math.floor(1000 + Math.random() * 9000).toString(); //4 digits
  }

  //attempt a handful of times for uniqueness
  for (let i = 0; i < 8; i++) {
    const code = makeCode() + makeCode(); //8 digits

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

//helper functions for security
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clampString(s: unknown, max: number) {
  const v = (typeof s === "string" ? s : "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function isValidEmail(email: string) {
  // simple + safe (not perfect RFC, but solid)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function normalizePhone(input: string) {
  // keep digits + leading +
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  const out = (hasPlus ? "+" : "") + digits;
  // allow 10–15 digits (common ranges)
  const digitsOnly = out.replace(/[^\d]/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return null;
  return out;
}

function parseMoney(n: unknown) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  // allow 0..10000
  if (x < 0 || x > 10000) return null;
  // round to 2 decimals
  return Math.round(x * 100) / 100;
}

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}