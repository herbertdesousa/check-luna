import type { CheckinType } from "@/domain/checkin";

export const TYPE_LABEL: Record<CheckinType, string> = {
  water: "Água",
  food: "Comida",
  gym: "Força",
  cardio: "Cardio",
  super: "Super",
};
