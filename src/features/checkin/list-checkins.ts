import "server-only";
import { and, asc, count, desc, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import { checkinPictures, checkins } from "@/db/schema";
import { CHECKIN_TYPES, MAX_BACKDATE_DAYS, dayOf, shiftDay, type CheckinStatus, type CheckinType } from "@/domain/checkin";

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

export type PendingItem = {
  id: string;
  userId: string;
  type: CheckinType;
  createdAt: Date;
  pictureIds: string[];
};

/** Check-ins aguardando revisão, do mais antigo para o mais novo. */
export async function listPending(): Promise<PendingItem[]> {
  const rows = await db
    .select()
    .from(checkins)
    .where(eq(checkins.status, "review"))
    .orderBy(asc(checkins.createdAt));

  const pictures = await db
    .select({ id: checkinPictures.id, checkinId: checkinPictures.checkinId })
    .from(checkinPictures)
    .where(inArray(checkinPictures.checkinId, rows.map((r) => r.id)));
  const byCheckin = Map.groupBy(pictures, (p) => p.checkinId);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    type: r.type,
    createdAt: r.createdAt,
    pictureIds: (byCheckin.get(r.id) ?? []).map((p) => p.id),
  }));
}

/**
 * Tipos com vaga ocupada por dia (qualquer status, negado inclusive, pois o
 * índice único bloqueia repetir), nos dias em que ainda se pode registrar.
 */
export async function listTakenByDay(userId: string): Promise<Record<string, CheckinType[]>> {
  const since = shiftDay(dayOf(new Date()), -MAX_BACKDATE_DAYS);
  const rows = await db
    .select({ day: checkins.day, type: checkins.type })
    .from(checkins)
    .where(and(eq(checkins.userId, userId), gte(checkins.day, since)));

  const byDay: Record<string, CheckinType[]> = {};
  for (const { day, type } of rows) (byDay[day] ??= []).push(type);
  return byDay;
}

/** Tipos postados por dia no intervalo (negado não conta). */
export async function listTypesByDay(
  userId: string,
  from: string,
  to: string,
): Promise<Record<string, CheckinType[]>> {
  const rows = await db
    .select({ day: checkins.day, type: checkins.type })
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId),
        gte(checkins.day, from),
        lte(checkins.day, to),
        ne(checkins.status, "denied"),
      ),
    );

  const byDay: Record<string, CheckinType[]> = {};
  for (const { day, type } of rows) (byDay[day] ??= []).push(type);
  return byDay;
}
