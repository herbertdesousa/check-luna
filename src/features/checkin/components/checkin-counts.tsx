import type { CheckinType } from "@/domain/checkin";
import { TYPE_EMOJI } from "./type-emojis";

const COUNT_ORDER: CheckinType[] = ["super", "water", "food", "cardio", "gym"];

export function CheckinCounts({ totals }: { totals: Record<CheckinType, number> }) {
  return (
    <ul className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm">
      {COUNT_ORDER.map((type) => (
        <li key={type} className="flex items-center gap-1">
          <span role="img" aria-label={type}>
            {TYPE_EMOJI[type]}
          </span>
          {totals[type]}x
        </li>
      ))}
    </ul>
  );
}
