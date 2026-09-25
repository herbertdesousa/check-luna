import type { CheckinType } from "@/domain/checkin";

const COUNT_ITEMS: { type: CheckinType; emoji: string }[] = [
  { type: "super", emoji: "🌟" },
  { type: "water", emoji: "💧" },
  { type: "food", emoji: "🍽️" },
  { type: "cardio", emoji: "🏃‍♀️" },
  { type: "gym", emoji: "💪" },
];

export function CheckinCounts({ totals }: { totals: Record<CheckinType, number> }) {
  return (
    <ul className="mb-4 flex justify-between text-sm">
      {COUNT_ITEMS.map(({ type, emoji }) => (
        <li key={type} className="flex items-center gap-1">
          <span role="img" aria-label={type}>
            {emoji}
          </span>
          {totals[type]}x
        </li>
      ))}
    </ul>
  );
}
