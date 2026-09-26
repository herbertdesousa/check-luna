import { NextResponse } from "next/server";
import { z } from "zod";
import { CHECKIN_TYPES } from "@/domain/checkin";
import { createCheckin } from "@/features/checkin/create-checkin";

// Funções da Vercel aceitam body de até 4.5MB (total, somando todas as fotos)
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const MAX_PHOTOS = 20;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(CHECKIN_TYPES),
  // instante ISO com offset; sem ele, vale "agora"
  takenAt: z.iso.datetime({ offset: true }).optional(),
  photos: z
    .array(
      z
        .instanceof(File)
        .refine((f) => PHOTO_TYPES.includes(f.type) && f.size > 0, "invalid_photo"),
    )
    .min(1)
    .max(MAX_PHOTOS)
    .refine((fs) => fs.reduce((sum, f) => sum + f.size, 0) <= MAX_TOTAL_BYTES, "too_large"),
});

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const body = formSchema.safeParse(form && {
      userId: form.get("userId"),
      type: form.get("type"),
      takenAt: form.get("takenAt") ?? undefined,
      photos: form.getAll("photos"),
    });
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { takenAt, ...input } = body.data;
  const result = await createCheckin({
    ...input,
    takenAt: takenAt ? new Date(takenAt) : new Date(),
  });
  if (!result.ok) {
    const status = result.error === "already_checked_in" ? 409 : 422;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json(result.checkin, { status: 201 });
}
