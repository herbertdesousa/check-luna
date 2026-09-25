import { IconAvocado, IconBarbell, IconDroplet, IconRun, type Icon } from "@tabler/icons-react";
import type { CheckinType } from "@/domain/checkin";

// `super` não tem ícone no tile
export const TYPE_ICON: Partial<Record<CheckinType, Icon>> = {
  food: IconAvocado,
  cardio: IconRun,
  gym: IconBarbell,
  water: IconDroplet,
};
