import { adminSession } from "@/lib/server/auth";

export class HttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export async function requireAdmin(request: Request) {
  const session = await adminSession(request.headers);
  if (!session.user) throw new HttpError(401, "Sua sessão expirou. Entre novamente no painel.");
  if (!session.authorized) throw new HttpError(403, "Esta conta não tem acesso de administrador.");
  return session.user;
}

export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new HttpError(403, "Recarregue a página para continuar.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Formato de solicitação inválido.");
}

export function errorResponse(error: unknown, operation: string) {
  console.error(`Admin API: ${operation} failed`, { type: error instanceof Error ? error.name : "unknown" });
  const status = error instanceof HttpError ? error.status : (error as { code?: string })?.code === "CONFLICT" ? 409 : 503;
  return Response.json({ error: error instanceof HttpError || status === 409 ? (error as Error).message : "Não foi possível concluir agora. Tente novamente em instantes." }, { status, headers: { "Cache-Control": "no-store" } });
}
