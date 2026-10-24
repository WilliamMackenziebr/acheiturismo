import { adminAuth } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const allowed = new Set(["/api/auth/sign-in/email", "/api/auth/sign-out", "/api/auth/get-session", "/api/auth/reset-password", "/api/auth/ok"]);

async function handle(request: Request) {
  if (!allowed.has(new URL(request.url).pathname)) return new Response(null, { status: 404 });
  try {
    const response = await adminAuth().handler(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) { return errorResponse(error, "authentication"); }
}
export const GET = handle;
export const POST = handle;
