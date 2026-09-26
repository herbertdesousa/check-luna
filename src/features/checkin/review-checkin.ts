import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { checkins } from "@/db/schema";
import { earnsSuper } from "@/domain/checkin";

export type Decision = "approved" | "denied";

/**
 * Aprova ou rejeita um check-in pendente. Ao aprovar, se o dia do usuário
 * ficou completo, concede o check-in `super` (já aprovado).
 */
export async function reviewCheckin(id: string, decision: Decision) {
  await db.transaction(async (tx) => {
    const [reviewed] = await tx
      .update(checkins)
      .set({ status: decision })
      .where(and(eq(checkins.id, id), eq(checkins.status, "review")))
      .returning();
    if (!reviewed || decision === "denied") return;

    const ofDay = await tx
      .select()
      .from(checkins)
      .where(and(eq(checkins.userId, reviewed.userId), eq(checkins.day, reviewed.day)));

    if (earnsSuper(ofDay, reviewed.userId, reviewed.day)) {
      await tx
        .insert(checkins)
        .values({ userId: reviewed.userId, day: reviewed.day, type: "super", status: "approved" })
        .onConflictDoNothing(); // índice único: no máximo um super por dia
    }
  });
}
