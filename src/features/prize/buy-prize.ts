import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prizeRequirements, prizes, purchases } from "@/db/schema";
import { balanceByType, canAfford } from "@/domain/prize";
import { countApprovedByType } from "@/features/checkin/list-checkins";
import { spentByType } from "./list-prizes";

const UNIQUE_VIOLATION = "23505";

export type BuyPrizeResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "not_enough_balance" | "already_purchased" };

export async function buyPrize(userId: string, prizeId: string): Promise<BuyPrizeResult> {
  const [exists] = await db.select({ id: prizes.id }).from(prizes).where(eq(prizes.id, prizeId));
  if (!exists) return { ok: false, error: "not_found" };

  const requirements = await db
    .select({ type: prizeRequirements.type, quantity: prizeRequirements.quantity })
    .from(prizeRequirements)
    .where(eq(prizeRequirements.prizeId, prizeId));

  const [approved, spent] = await Promise.all([countApprovedByType(userId), spentByType(userId)]);
  const balance = balanceByType(approved, spent);
  if (!canAfford(balance, requirements)) return { ok: false, error: "not_enough_balance" };

  try {
    await db.insert(purchases).values({ userId, prizeId });
    return { ok: true };
  } catch (e) {
    // corrida entre duas requisições: o índice único é a rede de segurança
    if ((e as { code?: string }).code === UNIQUE_VIOLATION) {
      return { ok: false, error: "already_purchased" };
    }
    throw e;
  }
}
