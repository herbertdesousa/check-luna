import { weekOf, type CheckinType, type Day } from "@/domain/checkin";
import { cn } from "@/lib/utils";
import { TYPE_EMOJI } from "./type-emojis";

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const LISTED_ORDER: CheckinType[] = ["water", "food", "gym", "cardio"];

/** Dia de super mostra só a estrela; os demais listam os tipos feitos. */
function emojisOf(types: CheckinType[]) {
  if (types.includes("super")) return TYPE_EMOJI.super;
  return LISTED_ORDER.filter((t) => types.includes(t))
    .map((t) => TYPE_EMOJI[t])
    .join("");
}

type Props = {
  today: Day;
  typesByDay: Record<Day, CheckinType[]>;
};

/** Semana (seg–dom) do dia atual; gruda no topo ao rolar. */
export function WeekStrip({ today, typesByDay }: Props) {
  return (
    // sticky: -mx-6/px-6 acompanha o padding do <main>
    <ol className="sticky top-0 z-10 -mx-6 mb-4 grid grid-cols-7 bg-background px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      {weekOf(today).map((day, i) => {
        const types = typesByDay[day] ?? [];
        const done = types.length > 0;
        const isToday = day === today;
        const isFuture = day > today;

        return (
          <li key={day} className="flex flex-col items-center gap-1 text-xs">
            <span className="text-muted-foreground">{WEEKDAYS[i]}</span>
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                isFuture && "border-border",
                !isFuture && !done && "border-transparent bg-muted text-muted-foreground",
                !isFuture && done && "border-transparent bg-primary/40",
                isToday && "border-primary",
              )}
            >
              {Number(day.slice(8))}
            </span>
            <span className="min-h-4 text-[10px] leading-4" aria-label={types.join(", ")}>
              {emojisOf(types)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
