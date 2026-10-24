import { database } from "@/lib/server/d1";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only a tombstone leaves the database for an unpublished listing.
    const result = await database().prepare("SELECT CASE WHEN status = 'published' THEN data ELSE json_object('id', id, 'status', 'archived', 'updatedAt', updated_at) END AS data, updated_at FROM tourism_entries UNION ALL SELECT json_object('id', id, 'status', 'archived', 'updatedAt', deleted_at) AS data, deleted_at AS updated_at FROM tourism_entry_deletions ORDER BY updated_at DESC").all<{ data: string }>();
    return Response.json({ entries: result.results.map(row => JSON.parse(row.data)) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error, "catalog"); }
}
