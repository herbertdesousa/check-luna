import { describe, expect, it } from "vitest";
import {
  earnsSuper,
  dayOf,
  formatTime,
  formatWhen,
  hourOf,
  shiftDay,
  validateTakenAt,
  validateNewCheckin,
  type Checkin,
  type CheckinStatus,
  type CheckinType,
} from "./checkin";

const DAY = "2026-09-25";
const checkin = (
  type: CheckinType,
  status: CheckinStatus = "approved",
  over: Partial<Checkin> = {},
): Checkin => ({ userId: "u1", type, day: DAY, status, ...over });

describe("dayOf", () => {
  it("usa o dia civil do fuso, não o UTC", () => {
    // 02:00 UTC de 26/09 ainda é 25/09 em São Paulo (UTC-3)
    expect(dayOf(new Date("2026-09-26T02:00:00Z"))).toBe("2026-09-25");
  });

  it("vira o dia à meia-noite local", () => {
    expect(dayOf(new Date("2026-09-26T03:00:00Z"))).toBe("2026-09-26");
  });

  it("aceita outro fuso", () => {
    expect(dayOf(new Date("2026-09-26T02:00:00Z"), "UTC")).toBe("2026-09-26");
  });
});

describe("validateNewCheckin", () => {
  const next = { userId: "u1", type: "water", day: DAY } as const;

  it("aceita o primeiro check-in do tipo no dia", () => {
    expect(validateNewCheckin([], next)).toBeNull();
  });

  it("recusa o mesmo tipo no mesmo dia", () => {
    expect(validateNewCheckin([checkin("water", "review")], next)).toBe(
      "already_checked_in",
    );
  });

  it("recusa mesmo se o anterior foi negado", () => {
    expect(validateNewCheckin([checkin("water", "denied")], next)).toBe(
      "already_checked_in",
    );
  });

  it("aceita tipo diferente no mesmo dia", () => {
    expect(validateNewCheckin([checkin("food")], next)).toBeNull();
  });

  it("aceita o mesmo tipo em outro dia", () => {
    expect(
      validateNewCheckin([checkin("water", "approved", { day: "2026-09-24" })], next),
    ).toBeNull();
  });

  it("aceita o mesmo tipo de outro usuário", () => {
    expect(
      validateNewCheckin([checkin("water", "approved", { userId: "u2" })], next),
    ).toBeNull();
  });

  it("recusa postar super", () => {
    expect(validateNewCheckin([], { ...next, type: "super" })).toBe(
      "super_not_allowed",
    );
  });
});

describe("earnsSuper", () => {
  const base = [
    checkin("water"),
    checkin("food"),
    checkin("gym"),
    checkin("cardio"),
  ];

  it("ganha com os 4 tipos base aprovados no dia", () => {
    expect(earnsSuper(base, "u1", DAY)).toBe(true);
  });

  it("não ganha com tipo faltando", () => {
    expect(earnsSuper(base.slice(0, 3), "u1", DAY)).toBe(false);
  });

  it.each(["review", "denied"] as const)("não conta check-in em %s", (status) => {
    const list = [...base.slice(0, 3), checkin("cardio", status)];
    expect(earnsSuper(list, "u1", DAY)).toBe(false);
  });

  it("não ganha um segundo super no mesmo dia", () => {
    expect(earnsSuper([...base, checkin("super")], "u1", DAY)).toBe(false);
  });

  it("ignora check-ins de outro dia", () => {
    const list = [
      ...base.slice(0, 3),
      checkin("cardio", "approved", { day: "2026-09-24" }),
    ];
    expect(earnsSuper(list, "u1", DAY)).toBe(false);
  });

  it("ignora check-ins de outro usuário", () => {
    const list = [
      ...base.slice(0, 3),
      checkin("cardio", "approved", { userId: "u2" }),
    ];
    expect(earnsSuper(list, "u1", DAY)).toBe(false);
  });

  it("super de outro dia não bloqueia", () => {
    const list = [...base, checkin("super", "approved", { day: "2026-09-24" })];
    expect(earnsSuper(list, "u1", DAY)).toBe(true);
  });
});

describe("formatTime", () => {
  it("formata hora e minuto como 12h50 no fuso local", () => {
    expect(formatTime(new Date("2026-09-25T15:50:00Z"))).toBe("12h50");
  });

  it("mantém dois dígitos e usa 00h à meia-noite", () => {
    expect(formatTime(new Date("2026-09-25T03:05:00Z"))).toBe("00h05");
  });
});

describe("formatWhen", () => {
  const now = new Date("2026-09-25T15:00:00Z"); // 25/09 12h00 em São Paulo

  it("hoje", () => {
    expect(formatWhen(new Date("2026-09-25T15:50:00Z"), now)).toBe("Hoje 12h50");
  });

  it("ontem", () => {
    expect(formatWhen(new Date("2026-09-24T14:25:00Z"), now)).toBe("Ontem 11h25");
  });

  it("dias anteriores", () => {
    expect(formatWhen(new Date("2026-09-01T12:15:00Z"), now)).toBe("01/09 09h15");
  });

  it("compara o dia no fuso local, não em UTC", () => {
    // 02:00 UTC de 26/09 ainda é 25/09 em São Paulo
    expect(formatWhen(new Date("2026-09-26T02:00:00Z"), now)).toBe("Hoje 23h00");
  });

  it("ontem atravessa a virada de mês", () => {
    const first = new Date("2026-10-01T15:00:00Z");
    expect(formatWhen(new Date("2026-09-30T15:00:00Z"), first)).toBe("Ontem 12h00");
  });
});

describe("shiftDay", () => {
  it("atravessa mês e ano", () => {
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDay("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftDay("2026-09-25", -7)).toBe("2026-09-18");
  });
});

describe("hourOf", () => {
  it("usa a hora local do fuso", () => {
    expect(hourOf(new Date("2026-09-25T15:50:00Z"))).toBe(12);
    expect(hourOf(new Date("2026-09-25T03:05:00Z"))).toBe(0);
  });
});

describe("validateTakenAt", () => {
  const now = new Date("2026-09-25T15:00:00Z"); // 25/09 12h00 em São Paulo

  it("aceita agora e o passado recente", () => {
    expect(validateTakenAt(now, now)).toBeNull();
    expect(validateTakenAt(new Date("2026-09-24T02:00:00Z"), now)).toBeNull();
  });

  it("tolera pequeno adiantamento do relógio do cliente", () => {
    expect(validateTakenAt(new Date("2026-09-25T15:04:00Z"), now)).toBeNull();
  });

  it("recusa o futuro", () => {
    expect(validateTakenAt(new Date("2026-09-25T15:10:00Z"), now)).toBe("in_future");
  });

  it("aceita até 7 dias atrás (dia civil) e recusa além disso", () => {
    // 18/09 00h00 em SP é o limite
    expect(validateTakenAt(new Date("2026-09-18T03:00:00Z"), now)).toBeNull();
    expect(validateTakenAt(new Date("2026-09-18T02:59:00Z"), now)).toBe("too_old");
  });
});
