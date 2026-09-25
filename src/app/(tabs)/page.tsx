import { CheckinFeed } from "@/features/checkin/components/checkin-feed";
import { listFeed } from "@/features/checkin/list-checkins";

export default async function FeedPage() {
  const items = await listFeed();
  const now = new Date();

  return (
    <>
      <h1 className="mb-4 text-lg font-bold">Vamo lá!!</h1>
      <CheckinFeed items={items} now={now} />
    </>
  );
}
