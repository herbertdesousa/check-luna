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

export type CheckinError =
  | "super_not_allowed"
  | "already_checked_in"
  | "in_future"
  | "too_old";

/** Até quantos dias atrás é possível registrar um check-in. */
export const MAX_BACKDATE_DAYS = 7;
/** Tolerância para relógio do cliente adiantado em relação ao servidor. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

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

/** Dia civil deslocado em `days` (negativo = para trás). */
export function shiftDay(day: Day, days: number): Day {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Os 7 dias (seg a dom) da semana que contém `day`. */
export function weekOf(day: Day): Day[] {
  const sinceMonday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
  const monday = shiftDay(day, -sinceMonday);
  return Array.from({ length: 7 }, (_, i) => shiftDay(monday, i));
}

/** Hora cheia (0–23) de um instante, no fuso informado. */
export function hourOf(instant: Date, timeZone = DEFAULT_TIME_ZONE): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(
      instant,
    ),
  );
}

/** Data informada pelo cliente: sem futuro e até `MAX_BACKDATE_DAYS` dias atrás. */
export function validateTakenAt(
  takenAt: Date,
  now: Date,
  timeZone = DEFAULT_TIME_ZONE,
): CheckinError | null {
  if (takenAt.getTime() > now.getTime() + CLOCK_SKEW_MS) return "in_future";
  const oldest = shiftDay(dayOf(now, timeZone), -MAX_BACKDATE_DAYS);
  return dayOf(takenAt, timeZone) < oldest ? "too_old" : null;
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
  if (day === shiftDay(today, -1)) return `Ontem ${time}`;

  const [, month, dayOfMonth] = day.split("-");
  return `${dayOfMonth}/${month} ${time}`;
}
