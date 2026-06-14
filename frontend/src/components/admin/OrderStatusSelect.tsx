"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/types/order";

const labels: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmee",
  PROCESSING: "Preparation",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PENDING", "PROCESSING", "CANCELLED"],
  PROCESSING: ["CONFIRMED", "SHIPPED", "CANCELLED"],
  SHIPPED: ["PROCESSING", "DELIVERED"],
  DELIVERED: ["SHIPPED"],
  CANCELLED: ["PENDING"],
};

const noteRequiredTransitions = new Set<string>([
  "CONFIRMED:PENDING",
  "PROCESSING:CONFIRMED",
  "SHIPPED:PROCESSING",
  "DELIVERED:SHIPPED",
  "CANCELLED:PENDING",
]);

export function OrderStatusSelect({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  value: OrderStatus;
  onChange: (status: OrderStatus, note?: string) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const options = [value, ...allowedTransitions[value]];

  function handleChange(nextStatus: OrderStatus) {
    if (nextStatus === value) {
      return;
    }

    if (noteRequiredTransitions.has(`${value}:${nextStatus}`)) {
      setPendingStatus(nextStatus);
      setNote("");
      return;
    }

    onChange(nextStatus);
  }

  function confirmCorrection() {
    if (!pendingStatus || !note.trim()) {
      return;
    }

    onChange(pendingStatus, note.trim());
    setPendingStatus(null);
    setNote("");
  }

  return (
    <>
      <select
        className="h-9 min-w-36 rounded-full border border-luxury-beige bg-luxury-ivory/55 px-3 text-xs font-semibold text-luxury-black outline-none transition hover:border-luxury-gold focus:border-luxury-gold focus:bg-white focus:ring-2 focus:ring-luxury-gold/15"
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        value={value}
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {labels[status]}
          </option>
        ))}
      </select>

      {pendingStatus ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-luxury-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-md border border-luxury-beige bg-white p-5 shadow-luxury">
            <h2 className="font-heading text-2xl font-semibold text-luxury-black">
              Confirmer la correction
            </h2>
            <p className="mt-2 text-sm leading-6 text-luxury-text">
              Le retour de {labels[value]} vers {labels[pendingStatus]} demande
              une note obligatoire pour garder une trace claire.
            </p>
            <label className="mt-4 block text-sm font-medium text-luxury-black">
              Note de correction
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-luxury-beige bg-white px-3 py-2 text-sm outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/15"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Expliquez pourquoi le statut est corrige..."
                value={note}
              />
            </label>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={disabled}
                onClick={() => setPendingStatus(null)}
                variant="soft"
              >
                Annuler
              </Button>
              <Button
                disabled={disabled || !note.trim()}
                onClick={confirmCorrection}
                variant="dark"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
