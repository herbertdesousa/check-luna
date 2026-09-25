import "server-only";
import { del, put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { checkinPictures, checkins } from "@/db/schema";
import { dayOf, validateNewCheckin, type CheckinError, type CheckinType } from "@/domain/checkin";

type Input = { userId: string; type: CheckinType; photos: File[] };

export type CreateCheckinResult =
  | {
      ok: true;
      checkin: typeof checkins.$inferSelect & {
        photos: (typeof checkinPictures.$inferSelect)[];
      };
    }
  | { ok: false; error: CheckinError };

const UNIQUE_VIOLATION = "23505";

export async function createCheckin(input: Input): Promise<CreateCheckinResult> {
  const day = dayOf(new Date());
  const next = { userId: input.userId, type: input.type, day };

  const existing = await db
    .select()
    .from(checkins)
    .where(and(eq(checkins.userId, input.userId), eq(checkins.day, day)));

  // valida as regras antes de subir as fotos, para não gerar arquivo à toa
  const error = validateNewCheckin(existing, next);
  if (error) return { ok: false, error };

  const prefix = `checkins/${input.userId}/${day}-${input.type}`;
  const blobs = await Promise.allSettled(
    input.photos.map((photo) =>
      put(`${prefix}-${photo.name}`, photo, { access: "private", addRandomSuffix: true }),
    ),
  );
  const uploaded = blobs.flatMap((b) => (b.status === "fulfilled" ? [b.value.url] : []));
  const failed = blobs.find((b) => b.status === "rejected");
  if (failed) {
    await del(uploaded);
    throw failed.reason;
  }

  try {
    const checkin = await db.transaction(async (tx) => {
      const [row] = await tx.insert(checkins).values(next).returning();
      const photos = await tx
        .insert(checkinPictures)
        .values(uploaded.map((photoUrl) => ({ checkinId: row.id, photoUrl })))
        .returning();
      return { ...row, photos };
    });
    return { ok: true, checkin };
  } catch (e) {
    await del(uploaded); // não deixa foto órfã
    // corrida entre duas requisições: o índice único é a rede de segurança
    if ((e as { code?: string }).code === UNIQUE_VIOLATION) {
      return { ok: false, error: "already_checked_in" };
    }
    throw e;
  }
}
