import { TYPE_EMOJI } from "@/features/checkin/components/type-emojis";
import type { AppPrize } from "../list-prizes";
import { BuyButton } from "./buy-button";

export function PrizeCard({ prize }: { prize: AppPrize }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-border p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem privada servida por rota própria */}
      <img
        src={`/api/prize-photos/${prize.id}`}
        alt=""
        className="size-20 shrink-0 rounded-xl bg-muted object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <p className="font-medium">{prize.name}</p>
          <p className="text-sm text-muted-foreground">
            {prize.requirements.map((r) => `${TYPE_EMOJI[r.type]}${r.quantity}`).join(" ")}
          </p>
        </div>
        <div className="self-end">
          <BuyButton
            prizeId={prize.id}
            disabled={prize.purchased || !prize.affordable}
            label={prize.purchased ? "Comprado" : "Comprar"}
          />
        </div>
      </div>
    </li>
  );
}
