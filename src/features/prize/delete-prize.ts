import "server-only";
import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prizes, purchases } from "@/db/schema";

const FOREIGN_KEY_VIOLATION = "23503";

export type DeletePrizeResult = { ok: true } | { ok: false; error: "already_purchased" };

/** Exclui o prêmio e sua foto; bloqueado se alguém já comprou (histórico do extrato depende dele). */
export async function deletePrize(id: string): Promise<DeletePrizeResult> {
  const [purchased] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(eq(purchases.prizeId, id))
    .limit(1);
  if (purchased) return { ok: false, error: "already_purchased" };

  try {
    const [prize] = await db.delete(prizes).where(eq(prizes.id, id)).returning();
    if (prize) await del(prize.photoUrl);
    return { ok: true };
  } catch (e) {
    // corrida com uma compra entre o select e o delete: a FK é a rede de segurança
    if ((e as { code?: string }).code === FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "already_purchased" };
    }
    throw e;
  }
}
