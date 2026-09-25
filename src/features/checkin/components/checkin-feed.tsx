import type { FeedItem } from "../list-checkins";
import { CheckinTile, type TileSize } from "./checkin-tile";

// Lido em linhas de duas colunas: pequena/grande, grande/grande, grande/pequena
const SIZES: TileSize[] = ["small", "large", "large", "large", "large", "small"];

/** Grade de duas colunas: itens alternam esquerda/direita, na ordem do feed. */
export function CheckinFeed({ items, now }: { items: FeedItem[]; now: Date }) {
  const columns = [0, 1].map((col) =>
    items.flatMap((item, i) => (i % 2 === col ? [{ item, size: SIZES[i % SIZES.length] }] : [])),
  );

  return (
    <div className="flex gap-4">
      {columns.map((tiles, col) => (
        <ul key={col} className="flex min-w-0 flex-1 flex-col gap-4">
          {tiles.map(({ item, size }) => (
            <CheckinTile key={item.id} item={item} size={size} now={now} />
          ))}
        </ul>
      ))}
    </div>
  );
}
