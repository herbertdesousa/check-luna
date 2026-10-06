import { connection } from "next/server";
import { PrizeAdminList } from "@/features/prize/components/prize-admin-list";
import { PrizeCreateForm } from "@/features/prize/components/prize-create-form";
import { listPrizes } from "@/features/prize/list-prizes";

export default async function AdminPrizesPage() {
  await connection(); // depende do banco: nunca pré-renderizar no build
  const prizes = await listPrizes();

  return (
    <>
      <h1 className="mb-4 text-lg font-bold">Prêmios</h1>
      <PrizeCreateForm />
      <PrizeAdminList prizes={prizes} />
    </>
  );
}
