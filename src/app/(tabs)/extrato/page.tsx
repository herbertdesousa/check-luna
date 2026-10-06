import { connection } from "next/server";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { ExtractList, type LedgerEntryDto } from "@/features/ledger/components/extract-list";
import { listLedger } from "@/features/ledger/list-ledger";

export default async function ExtratoPage() {
  await connection(); // depende do banco e da hora: nunca pré-renderizar no build
  const now = new Date();
  const { items, nextOffset } = await listLedger(CURRENT_USER_ID);

  const dtos: LedgerEntryDto[] = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <>
      <h1 className="mb-4 text-lg font-bold">Extrato</h1>
      <ExtractList initialItems={dtos} initialOffset={nextOffset} now={now.toISOString()} />
    </>
  );
}
