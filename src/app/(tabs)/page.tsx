import { connection } from "next/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { greetingCandidates, pickGreeting } from "@/domain/greeting";
import { CheckinCounts } from "@/features/checkin/components/checkin-counts";
import { CheckinFeed } from "@/features/checkin/components/checkin-feed";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import {
  countApprovedByType,
  listFeed,
  listTypesDoneToday,
} from "@/features/checkin/list-checkins";

export default async function FeedPage() {
  await connection(); // depende do banco e da hora: nunca pré-renderizar no build
  const [items, doneToday, totals] = await Promise.all([
    listFeed(),
    listTypesDoneToday(CURRENT_USER_ID),
    countApprovedByType(CURRENT_USER_ID),
  ]);
  const now = new Date();

  return (
    <>
      <h1 className="mb-2 text-lg font-bold">
        {pickGreeting(greetingCandidates(doneToday))}
      </h1>
      <CheckinCounts totals={totals} />
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
