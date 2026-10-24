import { createHash } from "node:crypto";
import { errorResponse, HttpError, requireAdmin, sameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin(request);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME, apiKey = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !secret) throw new HttpError(503, "O envio de fotos ainda está aguardando a conexão com o armazenamento.");
    const { entryId, photoId } = await request.json();
    if (![entryId, photoId].every(value => typeof value === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(value))) throw new HttpError(400, "Identificador de foto inválido.");
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `achei-turismo/${entryId}/${photoId}`;
    const signature = createHash("sha256").update(`overwrite=true&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
    return Response.json({ cloudName, apiKey, publicId, timestamp, signature }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error, "upload signature"); }
}
