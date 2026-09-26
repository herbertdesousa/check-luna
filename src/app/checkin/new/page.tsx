import { connection } from "next/server";
import { hourOf } from "@/domain/checkin";
import { newCheckinTitles, pickGreeting } from "@/domain/greeting";
import { NewCheckinForm } from "@/features/checkin/components/new-checkin-form";
import { CURRENT_USER_ID } from "@/features/checkin/current-user";
import { listTakenByDay } from "@/features/checkin/list-checkins";

export default async function NewCheckinPage() {
  await connection(); // depende do banco e da hora: nunca pré-renderizar no build
  const takenByDay = await listTakenByDay(CURRENT_USER_ID);
  const title = pickGreeting(newCheckinTitles(hourOf(new Date())));

  return <NewCheckinForm userId={CURRENT_USER_ID} title={title} takenByDay={takenByDay} />;
}
