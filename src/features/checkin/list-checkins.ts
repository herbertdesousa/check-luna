import "server-only";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { checkinPictures, checkins } from "@/db/schema";
import { CHECKIN_TYPES, dayOf, type CheckinStatus, type CheckinType } from "@/domain/checkin";

export type FeedItem = {
  id: string;
  type: CheckinType;
  status: CheckinStatus;
  createdAt: Date;
  pictureId: string;
};

const FEED_LIMIT = 50;

/** Check-ins mais recentes, cada um com uma foto aleatória das enviadas. */
export async function listFeed(): Promise<FeedItem[]> {
  const rows = await db
    .select()
    .from(checkins)
    .orderBy(desc(checkins.createdAt))
    .limit(FEED_LIMIT);

  const pictures = await db
    .select({ id: checkinPictures.id, checkinId: checkinPictures.checkinId })
    .from(checkinPictures)
    .where(inArray(checkinPictures.checkinId, rows.map((r) => r.id)));

  const byCheckin = Map.groupBy(pictures, (p) => p.checkinId);

  return rows.flatMap((row) => {
    const options = byCheckin.get(row.id);
    if (!options) return [];
    const pictureId = options[Math.floor(Math.random() * options.length)].id;
    return [{ id: row.id, type: row.type, status: row.status, createdAt: row.createdAt, pictureId }];
  });
}

/** Tipos que o usuário já postou hoje (check-in negado não conta). */
export async function listTypesDoneToday(userId: string): Promise<CheckinType[]> {
  const rows = await db
    .select({ type: checkins.type })
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId),
        eq(checkins.day, dayOf(new Date())),
        ne(checkins.status, "denied"),
      ),
    );
  return rows.map((r) => r.type);
}

/** Total de check-ins aprovados do usuário por tipo (zero quando não há). */
export async function countApprovedByType(
  userId: string,
): Promise<Record<CheckinType, number>> {
  const rows = await db
    .select({ type: checkins.type, total: count() })
    .from(checkins)
    .where(and(eq(checkins.userId, userId), eq(checkins.status, "approved")))
    .groupBy(checkins.type);

  const totals = Object.fromEntries(CHECKIN_TYPES.map((t) => [t, 0])) as Record<CheckinType, number>;
  for (const row of rows) totals[row.type] = row.total;
  return totals;
}
