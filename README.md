# Cleaning Company Quote Request Site + Owner Dashboard (Next.js)

A quote-request website for a cleaning business. Customers submit a quote request (with an **estimated price range**), both the owner and customer receive confirmation emails, and the owner manages requests from a secure dashboard (confirm / complete / cancel). Final pricing is recorded after the job is completed and paid.

---

## Tech Stack
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database + Auth + RLS)
- **Resend** (Email delivery)
- **Upstash Redis** (Rate limiting)

---

## What this project does

### Customer
1. Customer selects a service and sees an **estimated price range** (min–max)
2. Customer submits contact info + preferred quote date/time window + optional notes
3. Request is stored in Supabase
4. Emails are sent:
   - Owner gets a notification email with the confirmation code + details
   - Customer gets a receipt/confirmation email with the confirmation code

### Owner
- Owner logs in to protected routes (`/owner/*`) via Supabase Auth
- Access is restricted via an `admins` whitelist table
- Owner can:
  - View requests in list view (filters/search/sort/pagination)
  - View requests in weekly calendar view (by requested date)
  - Manage status transitions:
    - `NEW → CONFIRMED → COMPLETED` (requires final price)
    - `NEW/CONFIRMED → CANCELED`
  - Record the **final price charged** when completing a job

---

## Current Status

### ✅ Completed

- Customer quote request page (`/booking`)
  - Service selection with **estimated price range** (min–max)
  - Customer fields (name/phone/email/address) + optional notes
  - Preferred quote date + time window
  - Honeypot field for basic bot reduction
  - **Server-side validation + normalization**
    - Clamped string lengths, basic email validation, phone normalization
    - Price range validation (min ≤ max, bounds checking)

- Email notifications (Resend)
  - Owner email on new quote request (includes confirmation code + estimated range)
  - Customer confirmation email (receipt with confirmation code + estimated range)

- Vercel deployment + environment variables configured

- **Supabase integration**
  - `reservations` table for persistence
  - Pricing fields to support quote workflow:
    - `service_min_price`, `service_max_price` (estimated range)
    - `final_price` (entered by owner after job is completed/paid)
  - Row Level Security (RLS)
    - Admin-only read/update/delete via `admins` whitelist table
    - **Hardened public insert policy** so public users can only create `NEW` requests
      - Prevents bypass inserts like `COMPLETED` or pre-setting `final_price`

- **Owner dashboard** (`/owner`)
  - Secured with **Supabase Auth + admin whitelist** (`admins` table)
  - Reservation list view with:
    - Status filters (active/new/confirmed/completed/canceled/all)
    - Search (name/phone/email/address/code/service)
    - Sorting (created date + requested date)
    - Pagination
    - Displays **Final price charged** for completed jobs
  - Weekly calendar view (schedule-style view by requested date)
    - Always renders full week grid even when there are zero requests
  - Status management via API route:
    - Confirm / Complete (requires final price) / Cancel
    - **Server-enforced status transitions**
  - Owner logout button

- **Anti-spam (basic)**
  - **Rate limiting** on quote submissions using **Upstash Redis**

- UI/Theme polish
  - Unified styling so customer pages and owner dashboard share the same theme
  - Customer page transition fade

---

### 🧠 Planned / Next Up
- Dashboard UX polish
  - Improve labels/wording depending on filters/views
  - Cleaner layout/spacing refinements
  - Replace `prompt()` final price entry with a nicer modal/input UI

- Owner onboarding / production readiness
  - Add owner’s Supabase Auth user + whitelist UUID in `admins`
  - Purchase + connect a custom domain (and set up DNS/email sender alignment)

- Email deliverability improvements (after custom domain)
  - Verify domain/sender in Resend for better inbox placement
  - Owner email enhancements (direct dashboard link, cleaner formatting)

- Database constraints (hardening)
  - Add Postgres `CHECK` constraints for:
    - Allowed statuses
    - Price bounds + range validity
    - Length constraints for name/email/address/notes
  - (Optional) Move to an enum type for status

- Anti-spam upgrades (optional)
  - CAPTCHA (Cloudflare Turnstile / hCaptcha) after domain is registered
  - Optional duplicate detection (same phone/email within X minutes)








This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
