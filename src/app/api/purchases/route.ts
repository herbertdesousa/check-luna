import { NextResponse } from "next/server";
import { z } from "zod";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { buyPrize } from "@/features/prize/buy-prize";

const schema = z.object({ prizeId: z.uuid() });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await buyPrize(CURRENT_USER_ID, body.data.prizeId);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
