import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { prizeRequirements, prizes, purchases } from "@/db/schema";
import { balanceByType, canAfford, type PrizeRequirement } from "@/domain/prize";
import type { CheckinType } from "@/domain/checkin";
import { countApprovedByType } from "@/features/checkin/list-checkins";

export type Prize = {
  id: string;
  name: string;
  photoUrl: string;
  requirements: PrizeRequirement[];
};

/** Catálogo de prêmios com seus requisitos, na ordem em que foram cadastrados. */
export async function listPrizes(): Promise<Prize[]> {
  const rows = await db.select().from(prizes).orderBy(asc(prizes.createdAt));

  const reqs = await db
    .select({
      prizeId: prizeRequirements.prizeId,
      type: prizeRequirements.type,
      quantity: prizeRequirements.quantity,
    })
    .from(prizeRequirements)
    .where(inArray(prizeRequirements.prizeId, rows.map((r) => r.id)));
  const byPrize = Map.groupBy(reqs, (r) => r.prizeId);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    photoUrl: r.photoUrl,
    requirements: (byPrize.get(r.id) ?? []).map(({ type, quantity }) => ({ type, quantity })),
  }));
}

/** Total já gasto por tipo em compras aprovadas (soma dos requisitos dos prêmios comprados). */
export async function spentByType(userId: string): Promise<Partial<Record<CheckinType, number>>> {
  const rows = await db
    .select({ type: prizeRequirements.type, quantity: prizeRequirements.quantity })
    .from(purchases)
    .innerJoin(prizeRequirements, eq(prizeRequirements.prizeId, purchases.prizeId))
    .where(eq(purchases.userId, userId));

  const spent: Partial<Record<CheckinType, number>> = {};
  for (const r of rows) spent[r.type] = (spent[r.type] ?? 0) + r.quantity;
  return spent;
}

export type AppPrize = Prize & { purchased: boolean; affordable: boolean };

/** Catálogo de prêmios já cruzado com o saldo e as compras do usuário, pra tela de prêmios. */
export async function listPrizesForApp(userId: string): Promise<AppPrize[]> {
  const [all, approved, spent, purchasedRows] = await Promise.all([
    listPrizes(),
    countApprovedByType(userId),
    spentByType(userId),
    db.select({ prizeId: purchases.prizeId }).from(purchases).where(eq(purchases.userId, userId)),
  ]);

  const balance = balanceByType(approved, spent);
  const purchasedIds = new Set(purchasedRows.map((p) => p.prizeId));

  return all.map((prize) => ({
    ...prize,
    purchased: purchasedIds.has(prize.id),
    affordable: canAfford(balance, prize.requirements),
  }));
}
