import { Button } from "@/components/ui/button";
import { TYPE_EMOJI } from "@/features/checkin/components/type-emojis";
import type { Prize } from "../list-prizes";
import { deletePrizeAction } from "../actions";

export function PrizeAdminList({ prizes }: { prizes: Prize[] }) {
  if (prizes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum prêmio cadastrado ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {prizes.map((prize) => (
        <li key={prize.id} className="flex items-center gap-3 rounded-xl border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem privada servida por rota própria */}
          <img
            src={`/api/prize-photos/${prize.id}`}
            alt=""
            className="size-14 shrink-0 rounded-lg bg-muted object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{prize.name}</p>
            <p className="text-xs text-muted-foreground">
              {prize.requirements.map((r) => `${TYPE_EMOJI[r.type]}${r.quantity}`).join(" ")}
            </p>
          </div>
          <form action={deletePrizeAction}>
            <input type="hidden" name="id" value={prize.id} />
            <Button type="submit" size="sm" variant="destructive">
              Excluir
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
