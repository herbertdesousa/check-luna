"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { reviewCheckin } from "./review-checkin";

const schema = z.object({
  id: z.uuid(),
  decision: z.enum(["approved", "denied"]),
});

export async function reviewCheckinAction(formData: FormData) {
  const input = schema.parse(Object.fromEntries(formData));
  await reviewCheckin(input.id, input.decision);
  revalidatePath("/admin");
  revalidatePath("/");
}
