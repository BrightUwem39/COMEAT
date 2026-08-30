# Local Database Setup

ComEat uses PostgreSQL 17 for local development and Prisma ORM 7.10 for schema management and type-safe database access.

## Requirements

- Node.js 24
- Docker Desktop

## First-time setup

1. Copy `.env.example` to `.env` if the local file does not exist.
2. Replace the local PostgreSQL password placeholder in both `POSTGRES_PASSWORD` and `DATABASE_URL`.
3. Start PostgreSQL (host port `5434`, container port `5432`):

   ```bash
   npm run db:up
   ```

4. Confirm that the Prisma configuration is valid:

   ```bash
   npm run db:validate
   ```

5. Apply pending migrations and seed the confirmed menu:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

## Database commands

```text
npm run db:up        Start the local PostgreSQL container
npm run db:stop      Stop PostgreSQL without removing it
npm run db:down      Stop and remove the container and network
npm run db:logs      Follow PostgreSQL logs
npm run db:format    Format the Prisma schema
npm run db:validate  Validate the Prisma schema
npm run db:generate  Generate the typed Prisma Client
npm run db:seed      Seed or update the confirmed menu and operational settings
```

The named Docker volume is retained by `db:down`. Do not use `docker compose down --volumes` unless deleting all local database data is intentional.

## Security boundaries

- `.env` is ignored by Git and must never be committed.
- `.env.example` contains placeholders only.
- Local development credentials must never be reused in staging or production.
- The application must never store card numbers, CVC values, Stripe secret keys, or raw payment credentials in PostgreSQL.
- Browser cart prices are not authoritative; checkout will reload prices from PostgreSQL.

## Schema workflow

The initial migration creates the operational menu, customer, order, payment, inquiry, audit, and settings tables. The seed command is idempotent and uses `src/data/menu.ts` as the approved menu source.

The current seed produces:

- 17 active dishes across 3 internal administration categories;
- 11 dishes with confirmed pricing and 6 marked as price pending;
- 26 active size or quantity variants;
- required pepper levels 1–5 for all 17 dishes;
- the existing rice-type and Pepper Soup protein choices;
- 6 ordering and delivery settings.

Internal categories support menu administration and sorting. They do not require the customer-facing menu to display classifications.

## Server data layer

Application database access is restricted to the server-only modules in `src/server`:

- `db.ts` owns the reusable Prisma client and PostgreSQL connection pool;
- `menu.ts` returns minimal customer-safe menu DTOs without category notes, administration fields, or timestamps;
- `health.ts` performs the database availability check used by the health route.

The application health endpoint is available at:

```text
GET /api/health
```

It returns HTTP `200` when PostgreSQL is available and HTTP `503` when it is unavailable. Responses are never cached and do not include database credentials, host details, queries, or exception messages.
