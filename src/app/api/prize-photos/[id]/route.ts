import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prizes } from "@/db/schema";

export async function GET(_request: Request, { params }: RouteContext<"/api/prize-photos/[id]">) {
  const { id } = await params;

  const [prize] = await db
    .select({ photoUrl: prizes.photoUrl })
    .from(prizes)
    .where(eq(prizes.id, id))
    .catch(() => []); // id fora do formato uuid

  const blob = prize && (await get(prize.photoUrl, { access: "private" }));
  if (blob?.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
