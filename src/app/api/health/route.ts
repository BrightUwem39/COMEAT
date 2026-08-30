import { checkDatabaseHealth } from "@/server/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const database = await checkDatabaseHealth();

  return Response.json(
    {
      status: database.available ? "ok" : "unavailable",
      checkedAt: database.checkedAt,
      services: {
        database: {
          status: database.available ? "ok" : "unavailable",
          responseTimeMs: database.responseTimeMs,
        },
      },
    },
    {
      status: database.available ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
