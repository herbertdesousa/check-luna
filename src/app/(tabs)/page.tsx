import { connection } from "next/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { dayOf, weekOf } from "@/domain/checkin";
import { greetingCandidates, pickGreeting } from "@/domain/greeting";
import { balanceByType } from "@/domain/prize";
import { CheckinCounts } from "@/features/checkin/components/checkin-counts";
import { CheckinFeed } from "@/features/checkin/components/checkin-feed";
import { WeekStrip } from "@/features/checkin/components/week-strip";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import {
  countApprovedByType,
  listFeed,
  listTypesByDay,
} from "@/features/checkin/list-checkins";
import { spentByType } from "@/features/prize/list-prizes";

export default async function FeedPage() {
  await connection(); // depende do banco e da hora: nunca pré-renderizar no build
  const now = new Date();
  const today = dayOf(now);
  const week = weekOf(today);

  const [items, typesByDay, approved, spent] = await Promise.all([
    listFeed(),
    listTypesByDay(CURRENT_USER_ID, week[0], week[6]),
    countApprovedByType(CURRENT_USER_ID),
    spentByType(CURRENT_USER_ID),
  ]);
  const totals = balanceByType(approved, spent);

  return (
    <>
      <header className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-lg font-bold">
          {pickGreeting(greetingCandidates(typesByDay[today] ?? []))}
        </h1>
        <CheckinCounts totals={totals} />
      </header>
      <WeekStrip today={today} typesByDay={typesByDay} />
      <CheckinFeed items={items} now={now} />
      <Link
        href="/checkin/new"
        className={`${buttonVariants({ size: "lg" })} fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-6 z-20`}
      >
        Fazer check-in
      </Link>
    </>
  );
}
