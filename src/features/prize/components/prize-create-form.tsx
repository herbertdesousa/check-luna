import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHECKIN_TYPES } from "@/domain/checkin";
import { TYPE_LABEL } from "@/features/checkin/components/type-labels";
import { createPrizeAction } from "../actions";

/** Cadastro de prêmio via Server Action: funciona sem JS, inclusive o upload da foto. */
export function PrizeCreateForm() {
  return (
    <form action={createPrizeAction} className="mb-6 flex flex-col gap-3 rounded-xl border p-3">
      <Input name="name" placeholder="Nome do prêmio" required />
      <Input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required />
      <div className="grid grid-cols-2 gap-2">
        {CHECKIN_TYPES.map((type) => (
          <label key={type} className="flex items-center justify-between gap-2 text-sm">
            {TYPE_LABEL[type]}
            <Input type="number" name={`quantity_${type}`} min={0} defaultValue={0} className="w-16" />
          </label>
        ))}
      </div>
      <Button type="submit">Cadastrar</Button>
    </form>
  );
}
