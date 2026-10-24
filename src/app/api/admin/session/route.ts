import { adminSession } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await adminSession(request.headers);
    return Response.json({ ...session, storageReady: session.authorized && !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error, "session"); }
}
