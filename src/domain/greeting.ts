import { BASE_TYPES, type CheckinType } from "./checkin";

const GENERIC = ["Vamo lá!!", "Bora pra cima mo", "Vambora", "Uhull", "Simbora gatinha"];
const ALL_DONE = ["Agora só amanhã", "Trabalho concluido com sucesso"];

const MISSING_MESSAGE: Partial<Record<CheckinType, string>> = {
  cardio: "Um cardiozin hoje?",
  water: "Bebe agua ai mo",
  gym: "Dia de perna?",
};
const ONE_LEFT = "Só mais um check in para super!!";

/**
 * Mensagens possíveis para o topo do feed.
 * `doneToday`: tipos já feitos hoje pelo usuário, ou `null` se não há usuário
 * (só as genéricas). Com tudo feito, só as de conclusão.
 */
export function greetingCandidates(
  doneToday: readonly CheckinType[] | null,
): string[] {
  if (!doneToday) return GENERIC;

  const missing = BASE_TYPES.filter((t) => !doneToday.includes(t));
  if (missing.length === 0) return ALL_DONE;

  const contextual = missing.flatMap((t) => MISSING_MESSAGE[t] ?? []);
  if (missing.length === 1) contextual.push(ONE_LEFT);
  return [...GENERIC, ...contextual];
}

export function pickGreeting(
  candidates: readonly string[],
  random: () => number = Math.random,
): string {
  return candidates[Math.floor(random() * candidates.length)];
}
