import fs from "node:fs";
import assert from "node:assert/strict";
import { RemoteD1 } from "../src/lib/server/d1.ts";

if (!process.env.CLOUDFLARE_DB_URL || !process.env.CLOUDFLARE_DB_SECRET) throw new Error("Configure a conexão com o D1.");
const db = new RemoteD1(process.env.CLOUDFLARE_DB_URL, process.env.CLOUDFLARE_DB_SECRET);
const schema = await db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'tourism_entries'").all<{ sql: string }>();
if (!schema.results.length) throw new Error("Inicialize o banco antes de migrar o catálogo.");
const entries = await db.prepare("SELECT * FROM tourism_entries ORDER BY id").all<Record<string, unknown>>();
const expanded = schema.results[0].sql.includes("'destination'");
if (process.argv[2] !== "apply") {
  console.log(JSON.stringify({ databaseHost: new URL(process.env.CLOUDFLARE_DB_URL).hostname, entryCount: entries.results.length, expanded, changesApplied: false }));
} else {
  fs.mkdirSync(".local/backups", { recursive: true });
  const backup = `.local/backups/catalog-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(backup, JSON.stringify({ exportedAt: new Date().toISOString(), entries: entries.results }, null, 2));
  if (!expanded) {
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all<{ name: string }>();
    const references = await db.batch<{ table: string }>(tables.results.filter(row => !row.name.startsWith("_cf_") && !row.name.startsWith("sqlite_")).map(row => db.prepare(`PRAGMA foreign_key_list("${row.name.replace(/"/g, '""')}")`)));
    if (references.some(result => result.results.some(row => row.table === "tourism_entries"))) throw new Error("Existem referências adicionais ao catálogo. Revise a migração antes de continuar.");
    const customIndexes = await db.prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'tourism_entries' AND sql IS NOT NULL AND name != 'tourism_entries_status_updated'").all<{ sql: string }>();
    const statements = fs.readFileSync("cloudflare/expand-catalog.sql", "utf8").split(";").map(sql => sql.trim()).filter(Boolean);
    // D1 batch commits the table copy, replacement and indexes atomically.
    await db.batch([...statements, ...customIndexes.results.map(row => row.sql)].map(sql => db.prepare(sql)));
  }
  await db.prepare("CREATE TABLE IF NOT EXISTS tourism_entry_deletions (id TEXT PRIMARY KEY, deleted_at TEXT NOT NULL)").all();
  const after = await db.prepare("SELECT * FROM tourism_entries ORDER BY id").all<Record<string, unknown>>();
  // Concurrent additions and edits are valid; every original row must survive.
  const preserved = new Set(after.results.map(row => row.id));
  entries.results.forEach(row => assert.ok(preserved.has(row.id), "Um cadastro original não foi preservado."));
  console.log(JSON.stringify({ migrationApplied: true, originalEntryCount: entries.results.length, preservedEntryCount: after.results.length, backupSaved: backup }));
}
