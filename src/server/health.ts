import "server-only";

import { db } from "@/server/db";

export type DatabaseHealth = {
  available: boolean;
  checkedAt: string;
  responseTimeMs: number;
};

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = performance.now();

  try {
    await db.$queryRaw`SELECT 1`;

    return {
      available: true,
      checkedAt: new Date().toISOString(),
      responseTimeMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      available: false,
      checkedAt: new Date().toISOString(),
      responseTimeMs: Math.round(performance.now() - startedAt),
    };
  }
}
