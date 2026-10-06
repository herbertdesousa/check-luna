"use client";

import { useEffect, useRef, useState } from "react";
import { dayOf, formatDayLabel, formatTime, type CheckinStatus, type CheckinType } from "@/domain/checkin";
import { TYPE_EMOJI } from "@/features/checkin/components/type-emojis";
import { TYPE_LABEL } from "@/features/checkin/components/type-labels";

export type LedgerEntryDto =
  | { kind: "checkin"; id: string; type: CheckinType; status: CheckinStatus; createdAt: string }
  | { kind: "purchase"; id: string; prizeId: string; prizeName: string; createdAt: string };

type Props = {
  initialItems: LedgerEntryDto[];
  initialOffset: number | null;
  now: string;
};

/** Lista check-ins (income) e compras de prêmio (despesa) como extrato, agrupado por dia, com scroll infinito. */
export function ExtractList({ initialItems, initialOffset, now }: Props) {
  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const today = dayOf(new Date(now));

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || offset === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();

    async function loadMore() {
      if (loading) return;
      setLoading(true);
      const res = await fetch(`/api/ledger?offset=${offset}`);
      const data: { items: LedgerEntryDto[]; nextOffset: number | null } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setOffset(data.nextOffset);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadMore lê loading atual via closure, só precisa reobservar quando o offset muda
  }, [offset]);

  if (items.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Nada no extrato ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groupByDay(items).map((group) => (
        <section key={group.day}>
          <h2 className="mb-2 text-sm font-bold text-muted-foreground">
            {formatDayLabel(group.day, today)}
          </h2>
          <ul className="flex flex-col">
            {group.items.map((item) =>
              item.kind === "checkin" ? (
                <CheckinRow key={item.id} item={item} />
              ) : (
                <PurchaseRow key={item.id} item={item} />
              ),
            )}
          </ul>
        </section>
      ))}
      {offset !== null && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
          {loading ? "Carregando..." : ""}
        </div>
      )}
    </div>
  );
}

function groupByDay(items: LedgerEntryDto[]) {
  const groups: { day: string; items: LedgerEntryDto[] }[] = [];
  for (const item of items) {
    const day = dayOf(new Date(item.createdAt));
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

function Row({
  icon,
  title,
  subtitle,
  amount,
  amountClassName,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  amount: string;
  amountClassName: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-full bg-muted text-lg"
          aria-hidden
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <span className={`text-sm font-bold ${amountClassName}`}>{amount}</span>
    </li>
  );
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

function CheckinRow({
  item,
}: {
  item: { type: CheckinType; status: CheckinStatus; createdAt: string };
}) {
  const note = STATUS_NOTE[item.status];
  return (
    <Row
      icon={TYPE_EMOJI[item.type]}
      title={TYPE_LABEL[item.type]}
      subtitle={`${formatTime(new Date(item.createdAt))}${note ? ` · ${note}` : ""}`}
      amount="+1"
      amountClassName={AMOUNT_STYLE[item.status]}
    />
  );
}

function PurchaseRow({ item }: { item: { prizeName: string; createdAt: string } }) {
  return (
    <Row
      icon="🎁"
      title={item.prizeName}
      subtitle={formatTime(new Date(item.createdAt))}
      amount="−"
      amountClassName="text-destructive"
    />
  );
}
