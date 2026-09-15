import { buildOrderExport, csvResponse, parseExportRange } from "@/server/admin-exports";
import { getCurrentAdmin } from "@/server/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return new Response("Authentication required.", { status: 401 });
  if (!admin.permissions.includes("REPORTS_EXPORT")) return new Response("Your staff role cannot export reports.", { status: 403 });
  const range = parseExportRange(new URL(request.url));
  if (!range) return new Response("Choose a valid date range of no more than one year.", { status: 400 });
  const csv = await buildOrderExport(range.from, range.toExclusive);
  return csvResponse(csv, `comeat-orders-${range.fromValue}-to-${range.toValue}.csv`);
}
