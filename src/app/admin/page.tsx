import { Button } from "@/components/ui/button";
import { formatWhen } from "@/domain/checkin";
import { reviewCheckinAction } from "@/features/checkin/actions";
import { listPending } from "@/features/checkin/list-checkins";

// ⚠️ Sem autenticação: tela provisória só para testar o fluxo de aprovação.
export default async function AdminPage() {
  const pending = await listPending();
  const now = new Date();

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-8">
      <h1 className="mb-4 text-lg font-bold">Check-ins pendentes ({pending.length})</h1>
      {pending.length === 0 && <p className="text-sm opacity-60">Nada para revisar.</p>}
      <ul className="flex flex-col gap-4">
        {pending.map((c) => (
          <li key={c.id} className="rounded-xl border p-3">
            <p className="mb-2 text-sm font-medium">
              {c.userId} · {c.type} · {formatWhen(c.createdAt, now)}
            </p>
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {c.pictureIds.map((pictureId) => (
                // eslint-disable-next-line @next/next/no-img-element -- imagem privada servida por rota própria
                <img
                  key={pictureId}
                  src={`/api/pictures/${pictureId}`}
                  alt=""
                  loading="lazy"
                  className="size-24 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
            <form action={reviewCheckinAction} className="flex gap-2">
              <input type="hidden" name="id" value={c.id} />
              <Button type="submit" name="decision" value="approved" size="sm">
                Aprovar
              </Button>
              <Button type="submit" name="decision" value="denied" size="sm" variant="destructive">
                Rejeitar
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
