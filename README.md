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
- Reservation request form (basic booking flow)
- Email notification on new reservation
  - Email subject shows: **“New Reservation”**
- Environment variables configured for deployment (Vercel)
- **Supabase integration**
  - Postgres table to persist reservations
  - Row Level Security (RLS) policies for safe access
- **Owner Dashboard** (`/owner`)
  - **Secured with Supabase Auth + admin whitelist** (only approved users can access it)
  - View reservations from the database
  - Filter by status + search (name/phone/email/address/code/service)
  - Update reservation status (Confirm / Complete / Cancel)

### 🚧 Under Development
- Dashboard UX improvements (small polish items)
  - Better “status label” text depending on the selected filter
  - Cleaner formatting / layout refinements based on feedback

### 🧠 Planned / Next Up
- Owner logout button (so the owner can sign out without clearing cookies)
- Pagination / “Load more” for reservations (when the list grows)
- More sorting controls (ex: requested date vs created date)
- Calendar-style view (weekly schedule)
- Customer confirmation email (most likely will add this)
- Owner email notification improvements
  - Include confirmation code and a direct dashboard link
- Owner onboarding
  - Add the owner’s Supabase Auth user + whitelist their UUID in the `admins` table
---









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
