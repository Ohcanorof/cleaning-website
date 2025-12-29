# Cleaning Company Booking Site + Owner Dashboard (Next.js) — Work In Progress

A reservation/booking website for a cleaning business. Customers submit a reservation request, the owner gets an email notification, and a secure owner-only dashboard (in progress) will show all active reservations and basic analytics.

---

## Tech Stack
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database + Auth planned/used for owner access)
- **JSON** (used for data interchange/config where applicable)

---

## What this project does
### Customer
1. Customer fills out a reservation form
2. The system sends an email notification to the owner (Gmail)
3. (In progress) Reservation is stored in Supabase and becomes viewable in the owner dashboard

### Owner (in progress)
- Owner logs in to a protected route (ex: `/owner`)
- Owner can view active reservations and manage statuses

---

## Current Status

### ✅ Completed

- Customer quote request page (`/booking`)
  - Service selection with **estimated price range** (min–max)
  - Customer info fields (name/phone/email/address) + optional notes
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
    - Displays **Final price charged** when a reservation is completed
  - Weekly calendar view (schedule-style view by requested date)
    - Always renders full week grid even when there are zero requests
  - Status management via API route:
    - Confirm / Complete (requires final price) / Cancel
    - **Server-enforced status transitions** (NEW → CONFIRMED → COMPLETED, etc.)
  - Owner logout button

---

### 🚧 Under Development

- Dashboard UX polish
  - Improve labels/wording depending on filters/views
  - Cleaner layout/spacing refinements
  - Replace `prompt()` final price entry with a nicer modal/input UI

---

### 🧠 Planned / Next Up

- **Database constraints (hardening)**
  - Add Postgres `CHECK` constraints for:
    - Allowed statuses
    - Price bounds + range validity
    - Length constraints for name/email/address/notes
  - (Optional) Move to an enum type for status

- **Anti-spam / abuse protection**
  - Rate limiting and/or CAPTCHA (Cloudflare Turnstile / hCaptcha)
  - Optional: basic duplicate detection (same phone/email within X minutes)

- Email deliverability improvements
  - Verify domain/sender in Resend for better inbox placement
  - Owner email enhancements (direct dashboard link, cleaner formatting)

- Owner onboarding / production readiness
  - Add owner’s Supabase Auth user + whitelist UUID in `admins`
  - Purchase + connect a custom domain (and set up DNS/email sender alignment)









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
