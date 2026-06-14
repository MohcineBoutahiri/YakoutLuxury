"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Printer } from "lucide-react";
import {
  AdminFilterActions,
  AdminFilterBar,
  AdminFilterDate,
  AdminFilterInput,
  AdminFilterSearch,
  AdminFilterSelect,
} from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/admin/AdminTable";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Order, OrderStatus } from "@/types/order";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function getCustomerLabel(order: Order) {
  if (order.user) {
    return `${order.user.firstName} ${order.user.lastName} - ${order.user.email}`;
  }

  return order.userId;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [client, setClient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredOrders = useMemo(() => {
    const query = localSearch.trim().toLowerCase();

    return orders.filter((order) => {
      return (
        !query ||
        order.id.toLowerCase().includes(query) ||
        getCustomerLabel(order).toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query)
      );
    });
  }, [orders, localSearch]);

  function loadOrders() {
    setIsLoading(true);
    adminService
      .getOrders({
        status: status || undefined,
        client: client || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
      })
      .then(setOrders)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadOrders, []);

  function resetFilters() {
    setStatus("");
    setClient("");
    setDateFrom("");
    setDateTo("");
    setLocalSearch("");
    setIsLoading(true);
    adminService
      .getOrders()
      .then(setOrders)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  async function handleStatusChange(id: string, nextStatus: OrderStatus, note?: string) {
    setStatusUpdatingId(id);
    try {
      const updatedOrder = await adminService.updateOrderStatus(id, nextStatus, note);
      setOrders((current) =>
        current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
      showToast("success", "Statut de commande mis a jour.");
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <AdminLayout title="Commandes">
      <AdminFilterBar
        actions={<AdminFilterActions onFilter={loadOrders} onReset={resetFilters} />}
        className="xl:[grid-template-columns:minmax(220px,1.3fr)_minmax(190px,1fr)_minmax(145px,0.75fr)_minmax(135px,0.65fr)_minmax(135px,0.65fr)_auto]"
      >
        <AdminFilterSearch
          label="Recherche"
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Commande, client ou telephone"
          value={localSearch}
        />
        <AdminFilterInput
          label="Client"
          onChange={(event) => setClient(event.target.value)}
          placeholder="email, nom ou id"
          value={client}
        />
        <AdminFilterSelect
          label="Statut"
          onValueChange={(value) => setStatus(value as OrderStatus | "")}
          options={[["", "Tous"], ...statuses.map((item) => [item, item] as [string, string])]}
          value={status}
        />
        <AdminFilterDate
          label="Du"
          onChange={(event) => setDateFrom(event.target.value)}
          value={dateFrom}
        />
        <AdminFilterDate
          label="Au"
          onChange={(event) => setDateTo(event.target.value)}
          value={dateTo}
        />
      </AdminFilterBar>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          description="Aucune commande ne correspond aux filtres selectionnes."
          title="Aucune commande"
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          description="Aucune commande ne correspond a votre recherche locale."
          title="Aucun resultat"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-luxury-text">
            {filteredOrders.length} commande(s) affichee(s)
          </p>
          <div className="hidden lg:block">
            <AdminTable
              headers={["Commande", "Client", "Date", "Statut", "Total", "Actions"]}
              minWidth="980px"
            >
              {filteredOrders.map((order) => (
                <tr className="border-b border-luxury-beige" key={order.id}>
                  <td className="px-5 py-4 font-semibold">
                    {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">{getCustomerLabel(order)}</p>
                      <p className="mt-1 text-xs text-luxury-text">{order.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-luxury-text">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <PriceDisplay price={order.totalAmount} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <IconActionButton
                        href={`/admin/orders/${order.id}`}
                        icon={<Eye size={15} />}
                        label="Voir"
                      />
                      <IconActionButton
                        href={`/admin/orders/${order.id}/ticket`}
                        icon={<Printer size={15} />}
                        label="Voir ticket"
                      />
                      <OrderStatusSelect
                        disabled={statusUpdatingId === order.id}
                        onChange={(nextStatus) => handleStatusChange(order.id, nextStatus)}
                        value={order.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-luxury-text">
                        {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                      </p>
                      <h3 className="mt-1 font-heading text-2xl font-semibold">
                        {getCustomerLabel(order)}
                      </h3>
                      <p className="mt-1 text-sm text-luxury-text">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")} - {order.phone}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-luxury-beige pt-4">
                    <span className="text-sm text-luxury-text">Total</span>
                    <PriceDisplay price={order.totalAmount} />
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <IconActionButton
                      href={`/admin/orders/${order.id}`}
                      icon={<Eye size={15} />}
                      label="Voir"
                    />
                    <IconActionButton
                      href={`/admin/orders/${order.id}/ticket`}
                      icon={<Printer size={15} />}
                      label="Voir ticket"
                    />
                    <OrderStatusSelect
                      disabled={statusUpdatingId === order.id}
                      onChange={(nextStatus) => handleStatusChange(order.id, nextStatus)}
                      value={order.status}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
