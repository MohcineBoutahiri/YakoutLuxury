"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/admin/AdminTable";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { fadeUp, smoothTransition, staggerContainer } from "@/lib/motion";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { ActivityLog, DashboardStats } from "@/types/admin";

function getStatusCount(stats: DashboardStats, status: string) {
  return (
    (stats.ordersByStatus ?? []).find((item) => item.status === status)?.count ?? 0
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      adminService.getActivityLogs({ limit: 5 }).catch(() => ({ data: [] })),
    ])
      .then(([nextStats, nextLogs]) => {
        setStats(nextStats);
        setLogs(nextLogs.data);
      })
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, []);

  const pendingOrders = stats ? getStatusCount(stats, "PENDING") : 0;
  const recentOrders = (stats?.recentOrders ?? []).slice(0, 5);
  const lowStockProducts = (stats?.lowStockProducts ?? []).slice(0, 5);
  const lowStockCount = lowStockProducts.length;

  const topProducts = useMemo(() => {
    if (!stats) {
      return [];
    }

    const sales = new Map<string, { name: string; quantity: number }>();

    for (const order of stats.recentOrders ?? []) {
      for (const item of order.items ?? []) {
        const current = sales.get(item.productId) ?? {
          name: item.name,
          quantity: 0,
        };
        current.quantity += item.quantity;
        sales.set(item.productId, current);
      }
    }

    return Array.from(sales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [stats]);

  return (
    <AdminLayout title="Dashboard">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="dashboard-loading"
            transition={smoothTransition}
          >
            <DashboardSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            animate="visible"
            exit="hidden"
            initial="hidden"
            key="dashboard-error"
            transition={smoothTransition}
            variants={fadeUp}
          >
            <Card>
              <CardContent className="p-4 text-sm text-luxury-text">{error}</CardContent>
            </Card>
          </motion.div>
        ) : stats ? (
          <motion.div
            animate="visible"
            className="grid gap-4"
            exit="hidden"
            initial="hidden"
            key="dashboard-data"
            transition={smoothTransition}
            variants={staggerContainer}
          >
          <motion.div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6" variants={staggerContainer}>
            <StatCard
              hint="Comptes inscrits"
              icon={Users}
              label="Total clients"
              value={stats.totalUsers}
            />
            <StatCard
              hint="Catalogue"
              icon={Package}
              label="Total produits"
              value={stats.totalProducts}
            />
            <StatCard
              hint="Toutes periodes"
              icon={ShoppingBag}
              label="Total commandes"
              value={stats.totalOrders}
            />
            <StatCard
              hint="Total commandes"
              icon={TrendingUp}
              label="Chiffre d'affaires"
              tone="light"
              value={<PriceDisplay price={stats.totalRevenue} />}
            />
            <StatCard
              hint="A traiter"
              icon={AlertCircle}
              label="En attente"
              value={pendingOrders}
            />
            <StatCard
              hint="Variantes faibles"
              icon={Warehouse}
              label="Faible stock"
              value={lowStockCount}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <DashboardCharts
            monthlyRevenue={stats.monthlyRevenue ?? []}
            ordersByStatus={stats.ordersByStatus ?? []}
            topProducts={topProducts}
            />
          </motion.div>

          <motion.div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]" variants={fadeUp}>
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="premium-eyebrow">Commandes</p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold">
                      Commandes recentes
                    </h2>
                  </div>
                  <Link href="/admin/orders">
                    <Button className="h-9 px-3 text-xs" size="sm" variant="soft">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <EmptyState
                    description="Les commandes recentes apparaitront ici apres les premiers achats."
                    title="Aucune commande recente"
                  />
                ) : (
                  <AdminTable headers={["Commande", "Client", "Statut", "Total"]}>
                    {recentOrders.map((order) => (
                      <tr
                        className="border-b border-luxury-beige transition hover:bg-luxury-ivory/45"
                        key={order.id}
                      >
                        <td className="px-5 py-4 font-medium">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-4 text-luxury-text">
                          {order.user?.email ?? order.userId}
                        </td>
                        <td className="px-5 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4">
                          <PriceDisplay price={order.totalAmount} />
                        </td>
                      </tr>
                    ))}
                  </AdminTable>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="premium-eyebrow">Stock</p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold">
                      Produits faible stock
                    </h2>
                  </div>
                  <Link href="/admin/products">
                    <Button className="h-9 px-3 text-xs" size="sm" variant="soft">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                {lowStockProducts.length === 0 ? (
                  <EmptyState
                    description="Aucune variante en stock faible actuellement."
                    title="Stock confortable"
                  />
                ) : (
                  <div className="grid gap-2">
                    {lowStockProducts.map((variant) => (
                      <div
                        className="rounded-md border border-luxury-beige bg-luxury-ivory/60 p-3"
                        key={variant.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{variant.product.name}</p>
                            <p className="mt-1 text-xs text-luxury-text">
                              {variant.size} / {variant.color}
                            </p>
                            <p className="mt-1 text-[11px] uppercase text-luxury-text">
                              SKU {variant.sku}
                            </p>
                          </div>
                          <span className="rounded-full bg-luxury-gold px-2.5 py-1 text-xs font-semibold text-luxury-black">
                            {variant.stock}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="premium-eyebrow">Audit</p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold">
                      Derniers logs d'activite
                    </h2>
                  </div>
                  <Link href="/admin/activity-logs">
                    <Button className="h-9 px-3 text-xs" size="sm" variant="soft">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                {logs.length === 0 ? (
                  <EmptyState
                    description="Les actions admin recentes apparaitront ici."
                    title="Aucun log recent"
                  />
                ) : (
                  <AdminTable
                    headers={["Date", "Admin", "Action", "Entite", "Description"]}
                    minWidth="900px"
                  >
                    {logs.map((log) => (
                      <tr className="border-b border-luxury-beige" key={log.id}>
                        <td className="px-5 py-4 text-sm text-luxury-text">
                          {new Date(log.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {log.admin
                            ? `${log.admin.firstName} ${log.admin.lastName}`
                            : "Admin supprime"}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold">
                          {log.action}
                        </td>
                        <td className="px-5 py-4 text-sm text-luxury-text">
                          {log.entity}
                        </td>
                        <td className="px-5 py-4 text-sm text-luxury-text">
                          {log.description ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </AdminTable>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </AdminLayout>
  );
}
