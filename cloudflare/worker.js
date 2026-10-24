// Private database transport. Only the Next.js server holds DB_BRIDGE_SECRET.
async function matchesSecret(provided, expected) {
  if (!provided || !expected) return false;
  const encode = new TextEncoder();
  const [left, right] = await Promise.all([provided, expected].map(value => crypto.subtle.digest("SHA-256", encode.encode(value))));
  const a = new Uint8Array(left), b = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

export default {
  async fetch(request, env) {
    const headers = { "Cache-Control": "no-store" };
    if (!await matchesSecret(request.headers.get("Authorization"), `Bearer ${env.DB_BRIDGE_SECRET || ""}`) || !env.DB_BRIDGE_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/query") return new Response(null, { status: 404, headers });
    if (Number(request.headers.get("Content-Length")) > 1_000_000) return new Response(null, { status: 413, headers });
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > 1_000_000) return new Response(null, { status: 413, headers });
      const { statements } = JSON.parse(raw);
      if (!Array.isArray(statements) || statements.length < 1 || statements.length > 50) return new Response(null, { status: 400, headers });
      const prepared = statements.map(item => {
        if (typeof item.sql !== "string" || item.sql.length > 100_000 || !Array.isArray(item.params) || item.params.length > 100) throw new Error("Invalid statement");
        return env.DB.prepare(item.sql).bind(...item.params);
      });
      const result = await env.DB.batch(prepared);
      return Response.json({ result }, { headers });
    } catch (error) {
      const conflict = /UNIQUE constraint/i.test(error.message);
      console.error("Database bridge request failed", { conflict });
      return Response.json({ error: conflict ? "CONFLICT" : "DATABASE_ERROR" }, { status: conflict ? 409 : 500, headers });
    }
  },
};
