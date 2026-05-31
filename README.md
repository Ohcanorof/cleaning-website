# Cleaning Company Quote Request Site + Owner Dashboard

A full-stack quote-request website for a cleaning business. Customers can submit a cleaning quote request with an estimated price range, receive a confirmation email, and the owner can manage requests from a protected dashboard.

This project is built as a real-world portfolio application to demonstrate full-stack development, authentication, database integration, form validation, email delivery, protected admin routes, and production-readiness practices.

---

## Tech Stack

- **Next.js** App Router
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
  - PostgreSQL database
  - Authentication
  - Row Level Security
- **Resend** for email delivery
- **Upstash Redis** for rate limiting
- **Vercel** for deployment

---

## What This Project Does

### Customer Flow

1. Customer visits the website.
2. Customer selects a cleaning service.
3. Customer sees an estimated price range.
4. Customer submits contact information, address, preferred quote date/time window, and optional notes.
5. Request is stored in Supabase.
6. Confirmation emails are sent:
   - Owner receives a notification email with the confirmation code and request details.
   - Customer receives a receipt/confirmation email with the confirmation code.

### Owner Flow

1. Owner logs in through the protected owner route.
2. Supabase Auth verifies the user.
3. The app checks the `admins` whitelist table.
4. Authorized owners can access the dashboard.
5. Owner can view, search, filter, sort, and manage quote requests.
6. Owner can confirm, complete, or cancel requests.
7. Final pricing is recorded after the job is completed and paid.

---

## Features

### Customer Features

- Quote request form at `/booking`
- Service selection
- Estimated price range display
- Contact information fields
- Preferred quote date and time window
- Optional notes
- Confirmation code generation
- Customer confirmation email
- Honeypot field for basic bot reduction
- Server-side validation and normalization

### Owner Features

- Protected owner login
- Owner dashboard at `/owner`
- Admin whitelist check through Supabase
- Reservation list view
- Weekly calendar-style view
- Search by name, phone, email, address, confirmation code, or service
- Filter by status
- Sort by created date or requested date
- Pagination
- Status management:
  - `NEW → CONFIRMED`
  - `CONFIRMED → COMPLETED`
  - `NEW/CONFIRMED → CANCELED`
- Final price required when completing a job
- Owner logout

### Backend / Security Features

- Supabase database integration
- Supabase Auth
- Row Level Security policies
- Admin-only read/update/delete access
- Hardened public insert policy
- Server-side booking validation
- Rate limiting with Upstash Redis
- Local fallback rate limiter for development
- Email notifications through Resend
- Server-enforced status transitions

---

## Current Status

The core MVP functionality is mostly complete.

### Working Locally

- Homepage loads
- Booking page loads
- Customer booking flow works
- Owner login works
- Owner dashboard loads after authentication
- Supabase connection works
- Email notification logic exists
- Rate limiting logic exists

### Still Needed

- Cleaner README/setup documentation
- `.env.example` for safe environment variable documentation
- GitHub Issues for remaining work
- Unit tests
- GitHub Actions CI workflow
- Dockerfile
- Supabase scheduled health check
- Owner login troubleshooting checklist
- Better frontend validation messages
- Replace `prompt()` final price input with a nicer modal/input UI
- Make password reset redirect environment-aware

---

## Important Routes

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/booking` | Customer quote request form |
| `/owner/login` | Owner login page |
| `/owner` | Protected owner dashboard |
| `/owner/update-password` | Owner password update flow |

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ohcanorof/cleaning-website.git
cd cleaning-website