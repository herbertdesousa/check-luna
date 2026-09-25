export const CHECKIN_TYPES = [
  "water",
  "food",
  "gym",
  "cardio",
  "super",
] as const;
export type CheckinType = (typeof CHECKIN_TYPES)[number];

export const CHECKIN_STATUSES = ["review", "approved", "denied"] as const;
export type CheckinStatus = (typeof CHECKIN_STATUSES)[number];

/** Tipos que o usuário posta; o `super` é concedido, nunca postado. */
export const BASE_TYPES = ["water", "food", "gym", "cardio"] as const;

export const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

/** Dia civil `YYYY-MM-DD` de um instante, no fuso informado. */
export type Day = string;

export type Checkin = {
  userId: string;
  type: CheckinType;
  day: Day;
  status: CheckinStatus;
};

export type NewCheckin = Pick<Checkin, "userId" | "type" | "day">;

export type CheckinError = "super_not_allowed" | "already_checked_in";

export function dayOf(instant: Date, timeZone = DEFAULT_TIME_ZONE): Day {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(instant);
}

/**
 * Regras para postar um check-in:
 * - `super` não pode ser postado.
 * - um tipo por dia por usuário, independente do status (denied inclusive).
 */
export function validateNewCheckin(
  existing: readonly Checkin[],
  next: NewCheckin
): CheckinError | null {
  if (next.type === "super") return "super_not_allowed";

  const taken = existing.some(
    (c) =>
      c.userId === next.userId && c.day === next.day && c.type === next.type
  );
  return taken ? "already_checked_in" : null;
}

/**
 * Ganha o super ao ter os 4 tipos base aprovados no dia,
 * se ainda não ganhou um super naquele dia.
 */
export function earnsSuper(
  existing: readonly Checkin[],
  userId: string,
  day: Day
): boolean {
  const ofDay = existing.filter((c) => c.userId === userId && c.day === day);
  if (ofDay.some((c) => c.type === "super")) return false;

  const approved = new Set(
    ofDay.filter((c) => c.status === "approved").map((c) => c.type)
  );
  return BASE_TYPES.every((t) => approved.has(t));
}

/** Hora do dia no formato `12h50`, no fuso informado. */
export function formatTime(instant: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(instant)
    .replace(":", "h");
}

function previousDay(day: Day): Day {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** `Hoje 12h50`, `Ontem 11h25` ou, para dias anteriores, `01/09 09h15`. */
export function formatWhen(
  instant: Date,
  now: Date,
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const day = dayOf(instant, timeZone);
  const today = dayOf(now, timeZone);
  const time = formatTime(instant, timeZone);

  if (day === today) return `Hoje ${time}`;
  if (day === previousDay(today)) return `Ontem ${time}`;

  const [, month, dayOfMonth] = day.split("-");
  return `${dayOfMonth}/${month} ${time}`;
}
