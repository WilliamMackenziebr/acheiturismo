import fs from "node:fs";
import crypto from "node:crypto";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { RemoteD1 } from "../src/lib/server/d1.ts";
import { places } from "../src/data/places.ts";
import { seedEntry } from "../src/lib/seed-entry.ts";

const command = process.argv[2];
if (!["init", "admin", "password-link"].includes(command)) throw new Error("Use init, admin ou password-link. Consulte docs/ADMIN.md.");
for (const name of ["CLOUDFLARE_DB_URL", "CLOUDFLARE_DB_SECRET", "BETTER_AUTH_SECRET"]) {
  if (!process.env[name]) throw new Error(`Configure ${name} no arquivo de ambiente local.`);
}
const db = new RemoteD1(process.env.CLOUDFLARE_DB_URL!, process.env.CLOUDFLARE_DB_SECRET!);
let resetToken: string | undefined;
const origin = process.env.ADMIN_SITE_URL || "https://www.acheioturismo.com.br";
const auth = betterAuth({
  appName: "Achei Turismo", baseURL: origin, secret: process.env.BETTER_AUTH_SECRET!, database: db,
  emailAndPassword: {
    enabled: true, minPasswordLength: 12, maxPasswordLength: 128, autoSignIn: false,
    resetPasswordTokenExpiresIn: 3600, revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ token }) => { resetToken = token; },
  },
  session: { expiresIn: 43200, updateAge: 3600 },
  rateLimit: { enabled: true, storage: "database" },
  advanced: { database: { validateSchema: false } }, telemetry: { enabled: false },
});

if (command === "init") {
  const migration = await getMigrations(auth.options);
  const sql = await migration.compileMigrations();
  if (sql.trim()) { fs.writeFileSync("cloudflare/auth-schema.sql", sql); await migration.runMigrations(); }
  await db.batch(fs.readFileSync("cloudflare/schema.sql", "utf8").split(";").map(sql => sql.trim()).filter(Boolean).map(sql => db.prepare(sql)));
  for (const place of places.filter(place => place.kind !== "evento")) {
    const entry = seedEntry(place);
    await db.prepare("INSERT INTO tourism_entries (id,slug,kind,status,data,created_at,updated_at) SELECT ?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM tourism_entry_deletions WHERE id = ?) ON CONFLICT(id) DO NOTHING")
      .bind(entry.id,entry.slug,entry.kind,entry.status,JSON.stringify(entry),entry.createdAt,entry.updatedAt,entry.id).all();
  }
  console.log("Banco inicializado. Os cadastros existentes foram preservados.");
} else {
  const email = (process.argv[3] || "acheiturismo2026@gmail.com").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  let result = await db.prepare("SELECT id FROM user WHERE email = ?").bind(email).all<{ id: string }>();
  if (command === "admin") {
    if (!result.results.length) {
      await auth.api.signUpEmail({ body: { email, password: crypto.randomBytes(40).toString("base64url"), name: "Administrador Achei Turismo" } });
      result = await db.prepare("SELECT id FROM user WHERE email = ?").bind(email).all<{ id: string }>();
    }
    if (result.results.length !== 1) throw new Error("Não foi possível identificar a conta.");
    await db.prepare("INSERT OR IGNORE INTO administrators (user_id,created_at) VALUES (?,?)").bind(result.results[0].id,new Date().toISOString()).all();
  } else {
    if (result.results.length !== 1) throw new Error("Administrador não encontrado.");
    const admin = await db.prepare("SELECT user_id FROM administrators WHERE user_id = ?").bind(result.results[0].id).all();
    if (!admin.results.length) throw new Error("Esta conta não é administradora.");
  }
  await auth.api.requestPasswordReset({ body: { email, redirectTo: `${origin}/admin` } });
  if (!resetToken) throw new Error("Não foi possível gerar o link.");
  fs.mkdirSync(".local", { recursive: true });
  fs.writeFileSync(".local/admin-password-link.json", JSON.stringify({ email, url: `${origin}/admin#setup=${encodeURIComponent(resetToken)}`, expiresAt: new Date(Date.now()+3600_000).toISOString() }, null, 2));
  console.log(`Link de uso único salvo em .local/admin-password-link.json para ${email}. Expira em uma hora. Nenhum e-mail foi enviado.`);
}
