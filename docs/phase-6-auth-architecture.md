# ComEat Phase 6 Authentication Architecture

## Purpose

Phase 6 adds optional customer accounts and secure administrator access without removing guest checkout. Accounts were originally optional in the project specification, but the later customer-profile and administration requirements now make authentication part of the approved system design.

This document records the architecture decision only. Packages, schema changes, API routes, and user interfaces begin in later Phase 6 steps.

## Selected authentication system

Use Better Auth with its Prisma adapter and the existing PostgreSQL database.

Reasons for this choice:

- it has an official Next.js App Router integration;
- its official Prisma adapter supports Prisma 7 and PostgreSQL;
- it supports database-backed sessions, email/password authentication, email verification, password reset, and account linking;
- it provides production rate limiting without requiring a separate authentication database;
- its user schema can be mapped and extended to preserve ComEat's existing customer and administrator data model.

Do not introduce a second customer identity store through Clerk, Supabase Auth, or another hosted identity database during Phase 6.

## Authentication methods

### Phase 6 baseline

- Email and password registration and sign-in.
- Verified email required before a normal customer session is issued in production.
- Password-reset links delivered through Resend.
- Guest checkout remains available and does not require registration.

### Optional Google sign-in

The architecture supports adding Google later through the same Better Auth account table. It remains disabled until the client supplies and approves:

- a Google Cloud OAuth project;
- production and local redirect URIs;
- `GOOGLE_CLIENT_ID`;
- `GOOGLE_CLIENT_SECRET`.

No placeholder Google button should be displayed while the provider is disabled.

## Database ownership and identity mapping

The existing Prisma `User` model remains ComEat's user record and the source of application authorization.

It will be extended in Step 6.2 with Better Auth's required core fields:

- `name`;
- `emailVerified`;
- `image`.

Existing ComEat fields remain:

- `firstName`;
- `lastName`;
- `phone`;
- `role`;
- `active`.

Better Auth will add these UUID-backed models:

- `Session` for revocable database sessions;
- `Account` for credential hashes and optional future social accounts;
- `Verification` for email-verification and password-reset tokens;
- `RateLimit` for shared production rate limiting.

Password hashes belong in `Account`; they must never be stored on `User`, returned in a session, logged, or sent to the browser.

## Role design

Keep the existing Prisma enum:

```text
CUSTOMER
ADMIN
```

Rules:

1. Every public registration receives `CUSTOMER`.
2. The role field is server-owned and rejected from public registration and profile-update input.
3. No public endpoint may create or promote an administrator.
4. Authentication answers who the user is; ComEat's server data-access layer decides what that user may do.
5. Every admin page, Route Handler, and Server Action must verify `role === ADMIN` close to the protected operation.
6. Hiding admin navigation is presentation only and is never treated as authorization.
7. Inactive users cannot establish or continue normal application access.

The Better Auth admin plugin is not required for the initial implementation. ComEat will use its narrower application-level role checks rather than enabling unused impersonation or broad user-management capabilities.

## Initial administrator process

The first administrator will be created without a committed default password:

1. The owner creates and verifies a normal customer account.
2. A local, server-only promotion command accepts the exact normalized email address.
3. The command refuses missing or ambiguous accounts and asks for explicit confirmation.
4. It changes only that user's role from `CUSTOMER` to `ADMIN` and writes an audit record.
5. Administrator promotion is not exposed as a public web route.

Production access to that command must use the production environment's protected operator workflow. Credentials must never be passed as command-line arguments or committed to Git.

## Session policy

Use revocable database-backed sessions rather than fully stateless sessions.

- Session lifetime: 7 days.
- Rolling refresh interval: 24 hours.
- No long-lived “remember me” option in the initial release.
- Logout revokes the current database session.
- Password reset revokes the user's other sessions.
- Disabling a user invalidates application access.
- Sensitive admin mutations must check the current session and role at execution time.
- A later security review may require recent reauthentication for especially sensitive admin operations.

Database validation on protected operations is preferred over a long-lived session-data cookie cache so role changes and revocations take effect promptly.

## Cookie policy

Authentication cookies must be:

- `HttpOnly`;
- `SameSite=Lax`;
- `Secure` in production;
- scoped to the application host;
- prefixed for ComEat;
- unavailable to client-side JavaScript.

Cross-subdomain cookies are not required. Authentication will use the same origin as the Next.js application.

## Registration policy

The registration form will collect:

- first name;
- last name;
- email;
- phone;
- password;
- password confirmation.

The server will:

- trim names and phone numbers;
- normalize email addresses to lowercase;
- validate all fields independently of the browser;
- enforce a password length of 10–128 characters;
- allow password managers and pasted passwords;
- never accept `role`, `active`, or verification state from the browser;
- return an enumeration-safe response when an email is already registered.

The display `name` stored for Better Auth will be constructed from the validated first and last names.

## Email verification and password recovery

Use Resend for transactional authentication messages.

- Verification links expire after 24 hours.
- Password-reset links expire after 1 hour.
- Verification and reset tokens are single-use.
- Password-reset requests return the same response whether an account exists or not.
- A completed password reset revokes other sessions.
- Redirect destinations are selected by the server and restricted to the ComEat origin.
- Tokens and reset URLs must never appear in application logs or analytics.

Real email delivery cannot be enabled until the client supplies the verified sending domain and from-address. Local development will use a safe test workflow that does not expose production secrets.

## Route design

Planned public pages:

```text
/login
/register
/forgot-password
/reset-password
/verify-email
```

Authentication API route:

```text
/api/auth/[...all]
```

Protected areas:

```text
/profile        authenticated customer or administrator
/admin          administrator only
```

Guest-accessible ordering routes remain available. A signed-in order may reference `User`; a guest order keeps a null `userId` and the existing customer snapshots.

## Authorization boundary

Authorization will follow the installed Next.js guidance:

- session verification lives in a server-only data-access layer;
- protected data functions perform their own authorization checks;
- every Server Action and Route Handler is treated as directly callable;
- page or navigation checks do not replace checks close to the data mutation;
- layouts are not the sole security boundary because they may not re-render on every navigation;
- client components receive minimal DTOs rather than raw user or session records.

A route-level proxy may be added later as an early redirect optimization, but it will not be treated as the authoritative security check.

## Navbar and profile behavior

- Logged-out profile icon: link to `/login`.
- Logged-in customer profile icon: link to `/profile`.
- Logged-in administrator: profile menu may also link to `/admin`.
- Logout is an explicit POST-backed authentication action.
- Session loading must not reorder or resize the mobile navbar.
- Mobile order remains hamburger, centered logo, profile, cart.

## Rate limiting and abuse controls

Use Better Auth's database-backed rate limiter so limits work consistently across multiple production instances.

Apply stricter rules to:

- email/password sign-in;
- registration;
- verification-email resend;
- forgot-password requests;
- password-reset attempts.

Rate-limit identity will use only a trusted proxy-provided client IP header in production. Cloudflare-specific headers must not be trusted until the production origin is configured to accept traffic only through Cloudflare.

## Required environment variables

Required for core authentication:

```text
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_SITE_URL
```

Required before real verification and password-reset email delivery:

```text
RESEND_API_KEY
AUTH_EMAIL_FROM
```

Optional and disabled until supplied:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Rules:

- `BETTER_AUTH_SECRET` must be a production-generated high-entropy secret and must differ between local and production environments.
- URLs must use the exact trusted origin; production uses HTTPS.
- no secret variable receives the `NEXT_PUBLIC_` prefix;
- `.env.example` will contain placeholders only;
- real values remain outside Git.

## Phase boundaries

Phase 6 will implement identity, sessions, customer access, role checks, account recovery, navbar integration, and secure first-admin promotion.

Phase 6 will not:

- remove guest checkout;
- build the operational admin dashboard;
- connect Stripe payments;
- expose menu or order mutation controls;
- enable Google sign-in without approved credentials;
- invent a production email address or domain.

## Official implementation references

- Better Auth Prisma adapter: https://better-auth.com/docs/adapters/prisma
- Better Auth database and field mapping: https://better-auth.com/docs/concepts/database
- Better Auth email and password: https://better-auth.com/docs/authentication/email-password
- Better Auth session management: https://better-auth.com/docs/concepts/session-management
- Better Auth cookies: https://better-auth.com/docs/concepts/cookies
- Better Auth rate limiting: https://better-auth.com/docs/concepts/rate-limit
- Better Auth Next.js integration: https://better-auth.com/docs/integrations/next
- Next.js authentication guide: local installed documentation at `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
