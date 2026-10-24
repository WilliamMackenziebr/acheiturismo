import { validateEntry, EntryValidationError } from "@/lib/entry-validation";
import { database } from "@/lib/server/d1";
import { errorResponse, requireAdmin, sameOrigin, HttpError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const result = await database().prepare("SELECT data FROM tourism_entries ORDER BY updated_at DESC").all<{ data: string }>();
    const deleted = await database().prepare("SELECT id FROM tourism_entry_deletions").all<{ id: string }>();
    return Response.json({ entries: result.results.map(row => JSON.parse(row.data)), deletedIds: deleted.results.map(row => row.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error, "list entries"); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin(request);
    const raw = await request.text();
    if (raw.length > 100_000) throw new HttpError(413, "O cadastro ultrapassou o tamanho permitido.");
    let payload;
    try { payload = JSON.parse(raw); } catch { throw new HttpError(400, "Cadastro inválido."); }
    const entry = validateEntry(payload);
    const db = database();
    const original = await db.prepare("SELECT created_at FROM tourism_entries WHERE id = ?").bind(entry.id).all<{ created_at: string }>();
    entry.createdAt = original.results[0]?.created_at || entry.createdAt;
    const saved = await db.prepare("INSERT INTO tourism_entries (id, slug, kind, status, data, created_at, updated_at) SELECT ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM tourism_entry_deletions WHERE id = ?) ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, kind = excluded.kind, status = excluded.status, data = excluded.data, updated_at = excluded.updated_at")
      .bind(entry.id, entry.slug, entry.kind, entry.status, JSON.stringify(entry), entry.createdAt, entry.updatedAt, entry.id).all();
    if (!saved.meta.changes) throw new HttpError(410, "Este cadastro já foi excluído. Atualize a lista para continuar.");
    return Response.json({ entry }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof EntryValidationError) return errorResponse(new HttpError(400, error.message), "validate entry");
    return errorResponse(error, "save entry");
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin(request);
    const raw = await request.text();
    if (raw.length > 500) throw new HttpError(400, "Solicitação inválida.");
    let id;
    try { id = JSON.parse(raw).id; } catch { throw new HttpError(400, "Cadastro inválido."); }
    if (typeof id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) throw new HttpError(400, "Cadastro inválido.");
    const db = database();
    const result = await db.batch([
      db.prepare("INSERT INTO tourism_entry_deletions (id, deleted_at) SELECT id, ? FROM tourism_entries WHERE id = ? ON CONFLICT(id) DO NOTHING").bind(new Date().toISOString(), id),
      db.prepare("DELETE FROM tourism_entries WHERE id = ?").bind(id),
      db.prepare("SELECT id FROM tourism_entry_deletions WHERE id = ?").bind(id),
    ]);
    if (!result[2].results.length) throw new HttpError(404, "Este cadastro não foi encontrado. Atualize a lista.");
    return Response.json({ deletedId: id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error, "delete entry"); }
}
