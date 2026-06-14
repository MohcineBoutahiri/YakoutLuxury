import { StatusBadge } from "@/components/admin/StatusBadge";
import type { OrderStatus } from "@/types/order";

const labels: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmee",
  PROCESSING: "Preparation",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge label={labels[status]} status={status} />;
}
