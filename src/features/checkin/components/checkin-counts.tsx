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
    <ul className="sticky top-0 z-10 -mx-6 mb-2 flex justify-between bg-background px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-sm">
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
