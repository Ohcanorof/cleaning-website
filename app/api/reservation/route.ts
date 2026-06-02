//temp code to test the email sending (worked)
/*export async function POST(req: Request) {
  const body = await req.json();
  console.log("Reservation received:", body);
  return Response.json({ ok: true });
}
  */

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { reservationEmailRatelimit, reservationIpRatelimit } from "@/lib/ratelimit";
import {
  assertSameOrigin,
  getClientIp,
  jsonError,
  rateLimitHeaders,
  readJson,
} from "@/lib/security";
import {
  isISODate,
  isValidEmail,
  normalizePhone,
  validateStrict,
  type Schema,
} from "@/lib/validation";

type ReservationPayload = {
  serviceId: string;
  serviceName: string;
  serviceMinPrice: number;
  serviceMaxPrice: number;
  serviceDescription?: string;
  requestedDate?: string;
  timeWindow?: string;
  notes?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  website?: string; // honeypot
};

// Strict, schema-based validation + sanitation
const ReservationSchema: Schema<ReservationPayload> = {
  serviceId: { type: "string", required: true, min: 1, max: 60 },
  serviceName: { type: "string", required: true, min: 1, max: 80 },
  serviceMinPrice: { type: "number", required: true, min: 0, max: 10000, decimals: 2 },
  serviceMaxPrice: { type: "number", required: true, min: 0, max: 10000, decimals: 2 },
  serviceDescription: { type: "string", required: false, max: 500, keepNewlines: true },
  requestedDate: { type: "string", required: false, max: 10 },
  timeWindow: { type: "string", required: false, max: 80 },
  notes: { type: "string", required: false, max: 1000, keepNewlines: true },
  fullName: { type: "string", required: true, min: 2, max: 80 },
  phone: { type: "string", required: true, min: 7, max: 20 },
  email: {
    type: "string",
    required: true,
    min: 3,
    max: 254,
    transform: (v) => v.toLowerCase(),
  },
  address: { type: "string", required: true, min: 5, max: 200 },
  website: { type: "string", required: false, max: 200 },
};

//email route four reservations
export async function POST(req: Request) {
  try {
    // Basic CSRF protection for browser requests.
    const originErr = assertSameOrigin(req);
    if (originErr) return originErr;

    // Parse JSON with a small size limit.
    const raw = await readJson(req, 16_384);
    const parsed = validateStrict(raw, ReservationSchema);
    if (!parsed.ok) {
      return jsonError(400, parsed.error, parsed.details ? { details: parsed.details } : undefined);
    }

    const body = parsed.data;

    // Honeypot: bots often fill this. We return ok but do not process.
    if (body.website) return Response.json({ ok: true });

    // --- Rate limiting (IP + email) ---
    const ip = getClientIp(req);
    const ipLimit = await reservationIpRatelimit.limit(`ip:${ip}`);
    if (!ipLimit.success) {
      return jsonError(
        429,
        "Too many requests. Please wait a bit and try again.",
        { limit: ipLimit.limit, remaining: ipLimit.remaining, reset: ipLimit.reset },
        rateLimitHeaders(ipLimit)
      );
    }

    const email = body.email;
    if (!isValidEmail(email)) {
      return jsonError(400, "Email looks invalid.");
    }

    const emailLimit = await reservationEmailRatelimit.limit(`email:${email}`);
    if (!emailLimit.success) {
      return jsonError(
        429,
        "Too many requests. Please wait a bit and try again.",
        { limit: emailLimit.limit, remaining: emailLimit.remaining, reset: emailLimit.reset },
        rateLimitHeaders(emailLimit)
      );
    }

    // --- Additional validation / normalization ---
    const phoneNormalized = normalizePhone(body.phone);
    if (!phoneNormalized) {
      return jsonError(400, "Phone number looks invalid.");
    }

    const minPrice = body.serviceMinPrice;
    const maxPrice = body.serviceMaxPrice;
    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice > maxPrice) {
      return jsonError(400, "Invalid estimated price range.");
    }

    const requestedDateRaw = (body.requestedDate ?? "").trim();
    if (requestedDateRaw && !isISODate(requestedDateRaw)) {
      return jsonError(400, "Invalid date format (use YYYY-MM-DD).");
    }
    const requestedDate = requestedDateRaw || null;

    const resendKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;
    const fromEmail = process.env.RESEND_FROM || "Reservations <onboarding@resend.dev>";

    if (!resendKey || !ownerEmail) {
      console.error("Server misconfiguration: missing RESEND_API_KEY or OWNER_EMAIL");
      return jsonError(500, "Server misconfiguration.");
    }

    const supabase = await createClient();

    //create a reservation confirmation code
    const confirmationCode = await generateUniqueCode(supabase);

    //1) Insert into DB
    //Make sure your reservations table includes confirmation_code
    // Store normalized data (avoid storing unsafe/unbounded strings).
    const { error: insertErr } = await supabase.from("reservations").insert({
      status: "NEW",
      confirmation_code: confirmationCode,

      service_id: body.serviceId,
      service_name: body.serviceName,
      service_min_price: minPrice,
      service_max_price: maxPrice,
      service_price: null,
      service_description: body.serviceDescription ?? null,

      requested_date: requestedDate,
      time_window: body.timeWindow || null,
      notes: body.notes || null,

      full_name: body.fullName,
      phone: phoneNormalized,
      email,
      address: body.address,
    });

    if (insertErr) {
      console.error("Supabase insert error:", insertErr);
      return Response.json({ error: "Failed to save reservation." }, { status: 500 });
    }

    const resend = new Resend(resendKey);

    const min = Number(minPrice);
    const max = Number(maxPrice);
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
      <p><strong>Preferred Quote Date:</strong> ${escapeHtml(requestedDate ?? "")}</p>
      <p><strong>Preferred Quote Window:</strong> ${escapeHtml(body.timeWindow ?? "")}</p>
      <p><strong>Notes:</strong><br/>${escapeHtml(body.notes ?? "").replace(/\n/g, "<br/>")}</p>
      <hr/>
      <h3>Customer Info</h3>
      <p><strong>Name:</strong> ${escapeHtml(body.fullName)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phoneNormalized)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Address:</strong> ${escapeHtml(body.address)}</p>
    `;

    const ownerSend = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      replyTo: email, // owner can reply to customer quickly
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
      <p><strong>Preferred Quote Date:</strong> ${escapeHtml(requestedDate ?? "(not provided)")}</p>
      <p><strong>Preferred Quote Window:</strong> ${escapeHtml(body.timeWindow ?? "(not provided)")}</p>

      <hr/>
      <p>If you need to add details or change availability, just reply to this email or text/call the number on the website.</p>
    `;

    const customerSend = await resend.emails.send({
      from: fromEmail,
      to: email,
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
    if (err instanceof Error) {
      if (err.message === "payload_too_large") {
        return jsonError(413, "Payload too large.");
      }
      if (err.message === "unsupported_media_type") {
        return jsonError(415, "Unsupported content type. Use application/json.");
      }
    }
    // Avoid leaking internal details; return a generic error.
    return jsonError(400, "Invalid request.");
  }
}

async function generateUniqueCode(supabase: Awaited<ReturnType<typeof createClient>>) {
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

// helper functions for email safety
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}