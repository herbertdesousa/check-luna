import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { checkinPictures } from "@/db/schema";

// ⚠️ Sem autenticação ainda: qualquer um com o id da foto consegue vê-la.
export async function GET(_request: Request, { params }: RouteContext<"/api/pictures/[id]">) {
  const { id } = await params;

  const [picture] = await db
    .select({ photoUrl: checkinPictures.photoUrl })
    .from(checkinPictures)
    .where(eq(checkinPictures.id, id))
    .catch(() => []); // id fora do formato uuid

  const blob = picture && (await get(picture.photoUrl, { access: "private" }));
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
