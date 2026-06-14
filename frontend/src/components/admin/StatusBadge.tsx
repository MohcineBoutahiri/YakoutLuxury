import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/types/order";

type StatusTone = "gray" | "green" | "red" | "orange" | "blue" | "violet" | "gold";

type StatusConfig = {
  label: string;
  tone: StatusTone;
};

export type AdminStatusKey =
  | OrderStatus
  | "ACTIVE"
  | "INACTIVE"
  | "VERIFIED"
  | "UNVERIFIED"
  | "OUT_OF_STOCK"
  | "EXPIRED"
  | "FEATURED";

const statusMap: Record<AdminStatusKey, StatusConfig> = {
  PENDING: { label: "En attente", tone: "gold" },
  CONFIRMED: { label: "Confirmee", tone: "blue" },
  PROCESSING: { label: "Preparation", tone: "violet" },
  SHIPPED: { label: "Expediee", tone: "orange" },
  DELIVERED: { label: "Livree", tone: "green" },
  CANCELLED: { label: "Annulee", tone: "red" },
  ACTIVE: { label: "Actif", tone: "green" },
  INACTIVE: { label: "Inactif", tone: "gray" },
  VERIFIED: { label: "Verifie", tone: "green" },
  UNVERIFIED: { label: "Non verifie", tone: "orange" },
  OUT_OF_STOCK: { label: "Rupture", tone: "red" },
  EXPIRED: { label: "Expire", tone: "red" },
  FEATURED: { label: "Featured", tone: "gold" },
};

const toneClasses: Record<StatusTone, string> = {
  gray: "border-slate-200 bg-slate-100 text-slate-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  gold: "border-luxury-gold/35 bg-luxury-gold/15 text-luxury-black",
};

type StatusBadgeProps = {
  children?: ReactNode;
  className?: string;
  label?: string;
  status?: AdminStatusKey;
  tone?: StatusTone;
};

export function StatusBadge({
  children,
  className,
  label,
  status = "INACTIVE",
  tone,
}: StatusBadgeProps) {
  const config = statusMap[status];
  const resolvedTone = tone ?? config.tone;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold leading-none",
        toneClasses[resolvedTone],
        className,
      )}
    >
      {children ?? label ?? config.label}
    </span>
  );
}

export function getStatusLabel(status: AdminStatusKey) {
  return statusMap[status].label;
}
