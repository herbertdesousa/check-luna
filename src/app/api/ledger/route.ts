import { NextResponse } from "next/server";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { listLedger } from "@/features/ledger/list-ledger";

export async function GET(request: Request) {
  const offsetParam = new URL(request.url).searchParams.get("offset");
  const offset = offsetParam ? Number(offsetParam) : 0;
  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json({ error: "invalid_offset" }, { status: 400 });
  }

  const { items, nextOffset } = await listLedger(CURRENT_USER_ID, offset);
  return NextResponse.json({ items, nextOffset });
}
