"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { IconPhotoPlus, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MAX_BACKDATE_DAYS, dayOf, type CheckinType } from "@/domain/checkin";
import { TYPE_ICON } from "./type-icons";

const MAX_PHOTOS = 20;

const TYPE_OPTIONS: { type: CheckinType; label: string }[] = [
  { type: "gym", label: "Força" },
  { type: "food", label: "Comida" },
  { type: "water", label: "Água" },
  { type: "cardio", label: "Cardio" },
];

const ERROR_MESSAGES: Record<string, string> = {
  already_checked_in: "Esse check-in já foi feito nesse dia.",
  in_future: "A data não pode estar no futuro.",
  too_old: `Só dá para registrar até ${MAX_BACKDATE_DAYS} dias atrás.`,
  invalid_body: "Não deu pra salvar. Fotos: JPEG, PNG ou WebP, até 4MB no total.",
};

type Props = {
  userId: string;
  title: string;
  takenByDay: Record<string, CheckinType[]>;
};

// A data/hora inicial é a do navegador; só renderiza no cliente para não divergir do servidor.
const subscribe = () => () => {};
export function NewCheckinForm(props: Props) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  return isClient ? <Form {...props} /> : null;
}

/** `YYYY-MM-DDTHH:mm` no horário local, formato do input datetime-local. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Form({ userId, title, takenByDay }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [bounds] = useState(() => {
    const now = new Date();
    const oldest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - MAX_BACKDATE_DAYS);
    return { now: toLocalInput(now), oldest: toLocalInput(oldest) };
  });
  const [takenAtLocal, setTakenAtLocal] = useState(bounds.now);
  const [type, setType] = useState<CheckinType | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const takenAt = takenAtLocal ? new Date(takenAtLocal) : null;
  const takenToday = takenAt ? (takenByDay[dayOf(takenAt)] ?? []) : [];
  // tipo escolhido que ficou indisponível ao trocar a data deixa de valer
  const selected = type && !takenToday.includes(type) ? type : null;
  const canSave = !!selected && !!takenAt && photos.length > 0 && !saving;

  function addPhotos(files: FileList | null) {
    if (files) setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    if (fileInput.current) fileInput.current.value = ""; // permite reescolher o mesmo arquivo
  }

  async function save() {
    if (!selected || !takenAt) return;
    setSaving(true);
    setError(null);

    const body = new FormData();
    body.append("userId", userId);
    body.append("type", selected);
    body.append("takenAt", takenAt.toISOString());
    for (const photo of photos) body.append("photos", photo);

    try {
      const res = await fetch("/api/checkins", { method: "POST", body });
      if (res.ok) {
        router.push("/");
        return;
      }
      const { error: code } = await res.json().catch(() => ({ error: null }));
      setError(ERROR_MESSAGES[code] ?? "Erro ao salvar. Tente de novo.");
    } catch {
      setError("Sem conexão. Tente de novo.");
    }
    setSaving(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <h1 className="text-center text-lg font-bold">{title}</h1>

      <ToggleGroup
        variant="outline"
        className="mx-auto"
        value={selected ? [selected] : []}
        onValueChange={(value) => setType((value[0] as CheckinType | undefined) ?? null)}
      >
        {TYPE_OPTIONS.map(({ type: option, label }) => {
          const Icon = TYPE_ICON[option]!;
          return (
            <ToggleGroupItem
              key={option}
              value={option}
              disabled={takenToday.includes(option)}
              aria-label={label}
              className="h-auto flex-col gap-1 px-3 py-2"
            >
              <Icon size={24} />
              <span className="text-xs">{label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <Input
        type="datetime-local"
        aria-label="Data e hora"
        value={takenAtLocal}
        min={bounds.oldest}
        max={bounds.now}
        onChange={(e) => setTakenAtLocal(e.target.value)}
      />

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-3">
          {photos.map((file, i) => (
            <PhotoPreview
              key={`${file.name}-${file.lastModified}-${i}`}
              file={file}
              onRemove={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
            />
          ))}
        </ul>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => addPhotos(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={photos.length >= MAX_PHOTOS}
        onClick={() => fileInput.current?.click()}
      >
        <IconPhotoPlus />
        Adicionar fotinha
      </Button>

      <div className="mt-auto flex flex-col gap-2">
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <Button size="lg" disabled={!canSave} onClick={save}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </main>
  );
}

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl); // eslint-disable-line react-hooks/set-state-in-effect -- objectURL precisa de cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <li className="relative aspect-square overflow-hidden rounded-xl bg-muted">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:)
        <img src={url} alt="" className="size-full object-cover" />
      )}
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        aria-label="Remover foto"
        className="absolute top-1 right-1"
        onClick={onRemove}
      >
        <IconX />
      </Button>
    </li>
  );
}
