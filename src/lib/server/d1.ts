export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes: number; last_row_id: number };
}

export class DatabaseError extends Error {
  constructor(public readonly code: string) { super(code === "CONFLICT" ? "Este endereço já está em uso por outro cadastro." : "Não foi possível acessar os cadastros. Tente novamente."); }
}

class RemoteStatement {
  constructor(readonly database: RemoteD1, readonly sql: string, readonly params: unknown[] = []) {}
  bind(...params: unknown[]) { return new RemoteStatement(this.database, this.sql, params); }
  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> { return (await this.database.batch<T>([this]))[0]; }
}

// D1-compatible interface used by Better Auth's native SQLite/D1 adapter.
// The transport key is server-only, and is never returned to the browser.
export class RemoteD1 {
  constructor(private readonly url: string, private readonly secret: string) {}
  prepare(sql: string) { return new RemoteStatement(this, sql); }
  async batch<T = Record<string, unknown>>(statements: RemoteStatement[]): Promise<D1Result<T>[]> {
    const response = await fetch(new URL("/query", this.url), {
      method: "POST",
      headers: { Authorization: `Bearer ${this.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ statements: statements.map(statement => ({ sql: statement.sql, params: statement.params.map(value => value instanceof Date ? value.getTime() : typeof value === "boolean" ? Number(value) : value) })) }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    const data = await response.json() as { result?: D1Result<T>[]; error?: string };
    if (!response.ok || !data.result) throw new DatabaseError(data.error || "DATABASE_ERROR");
    return data.result;
  }
  async exec(sql: string) { return this.prepare(sql).all(); }
}

export function database() {
  const url = process.env.CLOUDFLARE_DB_URL, secret = process.env.CLOUDFLARE_DB_SECRET;
  if (!url || !secret) throw new Error("A conexão com os cadastros ainda não foi configurada.");
  return new RemoteD1(url, secret);
}
