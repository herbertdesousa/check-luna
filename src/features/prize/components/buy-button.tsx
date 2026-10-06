"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  not_enough_balance: "Saldo insuficiente.",
  already_purchased: "Você já comprou esse prêmio.",
  not_found: "Prêmio não encontrado.",
};

export function BuyButton({
  prizeId,
  disabled,
  label,
}: {
  prizeId: string;
  disabled: boolean;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeId }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const { error: code } = await res.json().catch(() => ({ error: null }));
      setError(ERROR_MESSAGES[code] ?? "Erro ao comprar.");
    } catch {
      setError("Sem conexão.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" disabled={disabled || loading} onClick={buy}>
        {loading ? "Comprando..." : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
