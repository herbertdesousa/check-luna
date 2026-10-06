import { describe, expect, it } from "vitest";
import { balanceByType, canAfford, costByType } from "./prize";

const ZERO = { water: 0, food: 0, gym: 0, cardio: 0, super: 0 };

describe("balanceByType", () => {
  it("subtrai o gasto do aprovado, tipo a tipo", () => {
    expect(balanceByType({ ...ZERO, gym: 5, water: 3 }, { gym: 2 })).toEqual({
      ...ZERO,
      gym: 3,
      water: 3,
    });
  });

  it("sem gasto, saldo é igual ao aprovado", () => {
    expect(balanceByType({ ...ZERO, food: 4 }, {})).toEqual({ ...ZERO, food: 4 });
  });
});

describe("costByType", () => {
  it("soma requisitos repetidos do mesmo tipo", () => {
    expect(
      costByType([
        { type: "gym", quantity: 2 },
        { type: "gym", quantity: 3 },
        { type: "water", quantity: 1 },
      ]),
    ).toEqual({ gym: 5, water: 1 });
  });
});

describe("canAfford", () => {
  it("aceita quando o saldo cobre todos os tipos exigidos", () => {
    const balance = { ...ZERO, gym: 5, water: 3 };
    expect(canAfford(balance, [{ type: "gym", quantity: 5 }, { type: "water", quantity: 3 }])).toBe(
      true,
    );
  });

  it("recusa quando falta saldo em um dos tipos", () => {
    const balance = { ...ZERO, gym: 5, water: 2 };
    expect(canAfford(balance, [{ type: "gym", quantity: 5 }, { type: "water", quantity: 3 }])).toBe(
      false,
    );
  });

  it("sem requisitos, qualquer saldo serve", () => {
    expect(canAfford(ZERO, [])).toBe(true);
  });
});
