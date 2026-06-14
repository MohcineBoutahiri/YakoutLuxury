import { StatusBadge } from "@/components/admin/StatusBadge";

type AdminStatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function AdminStatusBadge({
  active,
  activeLabel = "Actif",
  inactiveLabel = "Inactif",
}: AdminStatusBadgeProps) {
  return (
    <StatusBadge
      label={active ? activeLabel : inactiveLabel}
      status={active ? "ACTIVE" : "INACTIVE"}
      tone={active ? "green" : "gray"}
    />
  );
}
