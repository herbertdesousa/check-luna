import "server-only";
import { del, put } from "@vercel/blob";
import { db } from "@/db";
import { prizeRequirements, prizes } from "@/db/schema";
import type { CheckinType } from "@/domain/checkin";

type Input = {
  name: string;
  photo: File;
  requirements: { type: CheckinType; quantity: number }[];
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "prize";
}

export async function createPrize(input: Input) {
  const blob = await put(`prizes/${slugify(input.name)}`, input.photo, {
    access: "private",
    addRandomSuffix: true,
  });

  try {
    return await db.transaction(async (tx) => {
      const [prize] = await tx
        .insert(prizes)
        .values({ name: input.name, photoUrl: blob.url })
        .returning();
      if (input.requirements.length > 0) {
        await tx
          .insert(prizeRequirements)
          .values(input.requirements.map((r) => ({ prizeId: prize.id, ...r })));
      }
      return prize;
    });
  } catch (e) {
    await del(blob.url); // não deixa foto órfã
    throw e;
  }
}
