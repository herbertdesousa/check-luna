import { CHECKIN_TYPES, type CheckinType } from "./checkin";

export type PrizeRequirement = { type: CheckinType; quantity: number };

/** Saldo disponível por tipo: aprovados menos o que já foi gasto em compras. */
export function balanceByType(
  approved: Record<CheckinType, number>,
  spent: Partial<Record<CheckinType, number>>,
): Record<CheckinType, number> {
  return Object.fromEntries(
    CHECKIN_TYPES.map((type) => [type, approved[type] - (spent[type] ?? 0)]),
  ) as Record<CheckinType, number>;
}

/** Quantidade total exigida por tipo, somando requisitos repetidos do mesmo tipo. */
export function costByType(
  requirements: readonly PrizeRequirement[],
): Partial<Record<CheckinType, number>> {
  const cost: Partial<Record<CheckinType, number>> = {};
  for (const r of requirements) cost[r.type] = (cost[r.type] ?? 0) + r.quantity;
  return cost;
}

/** O saldo cobre o custo de todos os tipos exigidos pelo prêmio. */
export function canAfford(
  balance: Record<CheckinType, number>,
  requirements: readonly PrizeRequirement[],
): boolean {
  const cost = costByType(requirements);
  return Object.entries(cost).every(([type, qty]) => balance[type as CheckinType] >= qty!);
}
