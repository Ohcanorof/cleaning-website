# Project Audit/Checklist: House Cleaning Website

## Repo Snapshot Reviewed
For my own use, had this project reviewed, will delete once complete. 

Reviewed files from uploaded `app.zip` and `lib.zip`.

Important folders/files reviewed:

- `app/page.tsx`
- `app/booking/page.tsx`
- `app/api/reservation/route.ts`
- `app/api/reservation-status/route.ts`
- `app/auth/confirm/route.ts`
- `app/owner/page.tsx`
- `app/owner/login/page.tsx`
- `app/owner/login/LoginForm.tsx`
- `app/owner/update-password/page.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`
- `lib/ratelimit.ts`
- `lib/security.ts`
- `lib/validation.ts`

## Current Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
  - Auth
  - PostgreSQL database
  - Server/browser clients through `@supabase/ssr`
- Resend for owner/customer email notifications
- Upstash Redis for production rate limiting
- In-memory rate limit fallback for local development
- Vercel-style deployment assumptions are present in password reset URL

## Local Route Check

Reported local server behavior:

- `/` returns `200`
- `/booking` returns `200`
- `/owner` redirects with `307` to `/owner/login?next=/owner` when unauthenticated
- `/owner/login?next=/owner` returns `200`
- `/owner` returns `200` after successful login

This means the core local routing/auth flow is working for the developer account.

## What Works

### Public Website

- Home page exists.
- Customer-facing navigation exists.
- Image carousel exists using `embla-carousel-react`.
- Customer page transitions exist using `framer-motion`.
- Booking page exists at `/booking`.

### Booking Flow

- Customer can select a service.
- Current service options:
  - Standard Cleaning
  - Deep Cleaning
  - Move In/Move Out
- Customer can enter:
  - preferred date
  - preferred time window
  - notes
  - full name
  - phone
  - email
  - address
- Booking form submits to `/api/reservation`.
- Server inserts reservation into Supabase `reservations` table.
- Server generates an 8-digit confirmation code.
- Server sends owner email through Resend.
- Server sends customer confirmation email through Resend.
- If customer email fails but owner email succeeds, the reservation remains saved.

### Validation and Security

- Server-side validation exists through `validateStrict`.
- Unexpected JSON fields are rejected.
- Strings are trimmed and sanitized for control characters.
- Email validation exists.
- Phone normalization exists.
- Date format validation exists for `YYYY-MM-DD`.
- Honeypot field exists on booking form.
- Request body size limits exist.
- JSON content-type checks exist.
- Same-origin check exists for browser requests.
- Email HTML escaping exists.
- Rate limiting exists for reservation IP and reservation email.
- Local rate limiting falls back to in-memory storage if Upstash env vars are missing.

### Owner/Admin Flow

- Owner login page exists at `/owner/login`.
- Login uses Supabase Auth `signInWithPassword`.
- `/owner` checks authenticated user.
- `/owner` checks whether authenticated user exists in `admins` table.
- Unauthenticated users redirect to `/owner/login?next=/owner`.
- Non-admin users redirect to login.
- Owner dashboard can list reservations.
- Owner dashboard supports status filtering.
- Owner dashboard supports search.
- Owner dashboard supports sorting.
- Owner dashboard supports list/calendar views.
- Owner dashboard supports pagination.
- Owner can update reservation status through `/api/reservation-status`.
- Status transitions are enforced server-side:
  - `NEW` -> `CONFIRMED` or `CANCELED`
  - `CONFIRMED` -> `COMPLETED` or `CANCELED`
  - `COMPLETED` and `CANCELED` are terminal states
- Final price is required when completing a reservation.
- Owner actions are protected by authentication, admin whitelist check, same-origin check, validation, and rate limiting.

### Password Reset

- Forgot password flow exists.
- `/auth/confirm` handles Supabase code/token confirmation.
- `/owner/update-password` lets the owner set a new password after reset.

## Known Problems / Concerns

### Documentation / Repo Hygiene

- Need to confirm full repo includes a correct `.env.example`.
- Need to confirm README has clean setup instructions and no default Create Next App leftover sections.
- Need to confirm `package.json` scripts and dependencies.
- Need to confirm fresh clone setup from scratch.
- Need to confirm generated folders like `.next`, `out`, and `node_modules` are not committed.

### Testing

- No tests were visible in uploaded files.
- No unit test files were visible.
- Need tests for validation helpers.
- Need tests for status transition logic, ideally by extracting it from API route into a testable helper.
- Need at least one form/API behavior test later.

### CI/CD

- No GitHub Actions workflow was visible in uploaded files.
- Need CI to run install, lint, typecheck, and tests.

### Docker

- No Dockerfile was visible in uploaded files.
- Docker should be added after local setup and tests are stable.

### Supabase Health Check

- No scheduled health check was visible in uploaded files.
- Do not create fake customer bookings for this.
- Better approach: create a small `health_checks` table or run a safe scheduled read/update through GitHub Actions.

### Owner Login Reliability

- Local owner login works for the developer account based on reported route logs.
- If the business owner still has problems, likely causes are:
  - owner is using wrong credentials
  - owner account is not confirmed in Supabase Auth
  - owner user UUID is missing from `admins` table
  - owner reset link redirects to production URL only
  - production env vars differ from local env vars
  - browser cache/session issue
  - Supabase allowed redirect URLs are missing the required deployed URL

### Possible Code Improvements

- `LoginForm` has a hardcoded production password reset redirect URL. This should use an environment variable or derive from `window.location.origin`.
- Booking page relies mostly on server-side validation. Add client-side `required` attributes and clearer frontend validation messages.
- Service list is hardcoded in `app/booking/page.tsx`. This is fine for MVP, but later it could move to a shared config or database.
- `canTransition` is inside the route file, making it harder to unit test. Move it to a shared helper later.
- Reservation creation saves to DB before sending email. If owner email fails, the reservation stays saved but the response is an error. This is acceptable for MVP, but should be documented.
- Owner dashboard query ignores Supabase query errors. Add error handling UI for failed reservation fetches.

## MVP Scope

The MVP should be:

1. Customer can visit the site.
2. Customer can submit a quote request.
3. Request is saved in Supabase.
4. Owner receives an email notification.
5. Customer receives a confirmation email.
6. Owner can log in.
7. Owner can view quote requests.
8. Owner can filter/search quote requests.
9. Owner can update status: NEW, CONFIRMED, COMPLETED, CANCELED.
10. Owner can enter final price when completing.
11. App runs locally from a clean clone.
12. README explains setup clearly.
13. Basic tests exist.
14. CI runs on GitHub.
15. Supabase health check exists.

## Not MVP

- Online payments
- Customer accounts
- SMS notifications
- Advanced analytics
- Full calendar integration with Google Calendar
- Complex service pricing calculator
- Review/testimonial CMS
- Multi-owner/team roles
- Full production Docker Compose setup
- Perfect UI polish

## Immediate Next Actions

1. Add or update `.env.example`.
2. Update README local setup section.
3. Create GitHub issues for MVP, bugs, tests, CI, Docker, deployment, and Supabase health check.
4. Add tests for `lib/validation.ts`.
5. Extract `canTransition` to a helper and test it.
6. Fix password reset redirect so it is not hardcoded to production only.
7. Add GitHub Actions CI.
8. Add scheduled Supabase health check.
