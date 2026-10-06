import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { prizes, purchases } from "@/db/schema";
import type { CheckinStatus, CheckinType } from "@/domain/checkin";
import { listForLedger } from "@/features/checkin/list-checkins";

export type LedgerEntry =
  | { kind: "checkin"; id: string; type: CheckinType; status: CheckinStatus; createdAt: Date }
  | { kind: "purchase"; id: string; prizeId: string; prizeName: string; createdAt: Date };

const LEDGER_PAGE_SIZE = 20;

/** Check-ins e compras do usuário combinados, do mais recente ao mais antigo, paginado por offset. */
export async function listLedger(
  userId: string,
  offset = 0,
): Promise<{ items: LedgerEntry[]; nextOffset: number | null }> {
  const [checkinRows, purchaseRows] = await Promise.all([
    listForLedger(userId),
    db
      .select({
        id: purchases.id,
        prizeId: purchases.prizeId,
        prizeName: prizes.name,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .innerJoin(prizes, eq(prizes.id, purchases.prizeId))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt)),
  ]);

  const entries: LedgerEntry[] = [
    ...checkinRows.map((r) => ({ ...r, kind: "checkin" as const })),
    ...purchaseRows.map((r) => ({ ...r, kind: "purchase" as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const items = entries.slice(offset, offset + LEDGER_PAGE_SIZE);
  const nextOffset = offset + LEDGER_PAGE_SIZE < entries.length ? offset + LEDGER_PAGE_SIZE : null;
  return { items, nextOffset };
}
