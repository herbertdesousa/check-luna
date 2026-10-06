"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CHECKIN_TYPES } from "@/domain/checkin";
import { createPrize } from "./create-prize";
import { deletePrize } from "./delete-prize";

const createSchema = z.object({
  name: z.string().min(1),
  photo: z.instanceof(File).refine((f) => f.size > 0, "invalid_photo"),
});

export async function createPrizeAction(formData: FormData) {
  const input = createSchema.parse({
    name: formData.get("name"),
    photo: formData.get("photo"),
  });
  const requirements = CHECKIN_TYPES.map((type) => ({
    type,
    quantity: Number(formData.get(`quantity_${type}`) ?? 0),
  })).filter((r) => r.quantity > 0);

  await createPrize({ ...input, requirements });
  revalidatePath("/admin/prizes");
}

export async function deletePrizeAction(formData: FormData) {
  const { id } = z.object({ id: z.uuid() }).parse(Object.fromEntries(formData));
  const result = await deletePrize(id);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/admin/prizes");
}
