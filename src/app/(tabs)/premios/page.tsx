import { connection } from "next/server";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { PrizeCard } from "@/features/prize/components/prize-card";
import { listPrizesForApp } from "@/features/prize/list-prizes";

export default async function PremiosPage() {
  await connection(); // depende do banco: nunca pré-renderizar no build
  const prizes = await listPrizesForApp(CURRENT_USER_ID);

  return (
    <>
      <h1 className="mb-4 text-lg font-bold">Prêmios</h1>
      {prizes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum prêmio cadastrado ainda.</p>
      )}
      <ul className="flex flex-col gap-3">
        {prizes.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </ul>
    </>
  );
}
