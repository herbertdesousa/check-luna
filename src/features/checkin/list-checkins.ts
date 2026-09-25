import "server-only";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { checkinPictures, checkins } from "@/db/schema";
import type { CheckinStatus, CheckinType } from "@/domain/checkin";

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
