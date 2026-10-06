import { connection } from "next/server";
import { ExtractList, type LedgerItemDto } from "@/features/checkin/components/extract-list";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { listLedger } from "@/features/checkin/list-checkins";

export default async function ExtratoPage() {
  await connection(); // depende do banco e da hora: nunca pré-renderizar no build
  const now = new Date();
  const { items, nextCursor } = await listLedger(CURRENT_USER_ID);

  const dtos: LedgerItemDto[] = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <>
      <h1 className="mb-4 text-lg font-bold">Extrato</h1>
      <ExtractList
        initialItems={dtos}
        initialCursor={nextCursor ? nextCursor.toISOString() : null}
        now={now.toISOString()}
      />
    </>
  );
}
