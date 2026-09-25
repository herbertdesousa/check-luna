import {
  IconAvocado,
  IconBarbell,
  IconCircleDashedX,
  IconClock,
  IconDroplet,
  IconRun,
  type Icon,
} from "@tabler/icons-react";
import { formatWhen, type CheckinStatus, type CheckinType } from "@/domain/checkin";
import type { FeedItem } from "../list-checkins";

// `super` ainda não tem ícone definido
const TYPE_ICON: Partial<Record<CheckinType, Icon>> = {
  food: IconAvocado,
  cardio: IconRun,
  gym: IconBarbell,
  water: IconDroplet,
};

// aprovado não mostra ícone
const STATUS_ICON: Partial<Record<CheckinStatus, Icon>> = {
  review: IconClock,
  denied: IconCircleDashedX,
};

export type TileSize = "small" | "large";

const ASPECT: Record<TileSize, string> = {
  small: "aspect-square",
  large: "aspect-[4/7]",
};

export function CheckinTile({
  item,
  size,
  now,
}: {
  item: FeedItem;
  size: TileSize;
  now: Date;
}) {
  const TypeIcon = TYPE_ICON[item.type];
  const StatusIcon = STATUS_ICON[item.status];

  return (
    <li className={`relative overflow-hidden rounded-2xl bg-muted ${ASPECT[size]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem privada servida por rota própria */}
      <img
        src={`/api/pictures/${item.pictureId}`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {StatusIcon && (
        <span className="absolute top-2 right-2 rounded-full bg-black/40 p-1 text-white">
          <StatusIcon size={18} aria-label={item.status} />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-3 pt-10 pb-2 text-white">
        <span className="text-sm font-bold">{formatWhen(item.createdAt, now)}</span>
        {TypeIcon && <TypeIcon size={20} aria-label={item.type} />}
      </div>
    </li>
  );
}
