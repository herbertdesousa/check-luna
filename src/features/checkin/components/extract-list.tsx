"use client";

import { useEffect, useRef, useState } from "react";
import { dayOf, formatDayLabel, formatTime, type CheckinStatus, type CheckinType } from "@/domain/checkin";
import { TYPE_EMOJI } from "./type-emojis";
import { TYPE_LABEL } from "./type-labels";

export type LedgerItemDto = {
  id: string;
  type: CheckinType;
  status: CheckinStatus;
  day: string;
  createdAt: string;
};

type Props = {
  initialItems: LedgerItemDto[];
  initialCursor: string | null;
  now: string;
};

/** Lista os check-ins do usuário como lançamentos de extrato, agrupados por dia, com scroll infinito. */
export function ExtractList({ initialItems, initialCursor, now }: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const today = dayOf(new Date(now));

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !cursor) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();

    async function loadMore() {
      if (loading) return;
      setLoading(true);
      const res = await fetch(`/api/checkins?cursor=${encodeURIComponent(cursor!)}`);
      const data: { items: LedgerItemDto[]; nextCursor: string | null } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadMore lê loading/cursor atuais via closure, só precisa reobservar quando o cursor muda
  }, [cursor]);

  if (items.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Nenhum check-in ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groupByDay(items).map((group) => (
        <section key={group.day}>
          <h2 className="mb-2 text-sm font-bold text-muted-foreground">
            {formatDayLabel(group.day, today)}
          </h2>
          <ul className="flex flex-col">
            {group.items.map((item) => (
              <LedgerRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}
      {cursor && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
          {loading ? "Carregando..." : ""}
        </div>
      )}
    </div>
  );
}

function groupByDay(items: LedgerItemDto[]) {
  const groups: { day: string; items: LedgerItemDto[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last?.day === item.day) last.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }
  return groups;
}

// aprovado soma de verdade; review ainda não conta; negado nunca contou
const AMOUNT_STYLE: Record<CheckinStatus, string> = {
  approved: "text-primary",
  review: "text-muted-foreground",
  denied: "text-destructive line-through",
};

const STATUS_NOTE: Partial<Record<CheckinStatus, string>> = {
  review: "em revisão",
  denied: "negado",
};

function LedgerRow({ item }: { item: LedgerItemDto }) {
  const note = STATUS_NOTE[item.status];
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-full bg-muted text-lg"
          aria-hidden
        >
          {TYPE_EMOJI[item.type]}
        </span>
        <div>
          <p className="text-sm font-medium">{TYPE_LABEL[item.type]}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(new Date(item.createdAt))}
            {note && ` · ${note}`}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${AMOUNT_STYLE[item.status]}`}>+1</span>
    </li>
  );
}
