"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types/admin";

type DashboardChartsProps = {
  ordersByStatus: DashboardStats["ordersByStatus"];
  monthlyRevenue: DashboardStats["monthlyRevenue"];
  topProducts?: Array<{ name: string; quantity: number }>;
  newClientsByMonth?: Array<{ month: string; count: number }>;
};

const statusColors = ["#C8A24A", "#0B0B0B", "#E8DED0", "#6B6B6B", "#F8F5EF"];

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmees",
  PROCESSING: "Preparation",
  SHIPPED: "Expediees",
  DELIVERED: "Livrees",
  CANCELLED: "Annulees",
};

function formatMonth(month: string) {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "MAD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function ChartFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-44 items-center justify-center rounded-md border border-dashed border-luxury-beige bg-luxury-ivory/70 px-4 text-center text-xs leading-5 text-luxury-text">
      {message}
    </div>
  );
}

export function DashboardCharts({
  monthlyRevenue,
  newClientsByMonth = [],
  ordersByStatus,
  topProducts = [],
}: DashboardChartsProps) {
  const revenueData = (monthlyRevenue ?? []).map((item) => ({
    month: formatMonth(item.month),
    revenue: item.revenue,
  }));

  const statusData = (ordersByStatus ?? []).map((item) => ({
    name: statusLabels[item.status] ?? item.status,
    value: item.count,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="premium-eyebrow">Chiffre d'affaires</p>
              <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
                Revenue mensuel
              </h2>
            </div>
            <p className="text-xs text-luxury-text">Evolution des ventes</p>
          </div>
          <div className="h-60 sm:h-64">
            {revenueData.length === 0 ? (
              <ChartFallback message="Aucun chiffre d'affaires a afficher pour le moment." />
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={revenueData} margin={{ bottom: 8, left: -22, right: 8 }}>
                  <defs>
                    <linearGradient id="revenueGold" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#C8A24A" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#C8A24A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E8DED0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6B6B6B", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#6B6B6B", fontSize: 12 }}
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ color: "#0B0B0B" }}
                  />
                  <Area
                    dataKey="revenue"
                    fill="url(#revenueGold)"
                    stroke="#C8A24A"
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-3">
            <p className="premium-eyebrow">Commandes</p>
            <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
              Par statut
            </h2>
          </div>
          <div className="h-56 sm:h-60">
            {statusData.length === 0 ? (
              <ChartFallback message="Aucune commande pour le moment." />
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={statusData}
                    dataKey="value"
                    innerRadius="48%"
                    outerRadius="76%"
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        fill={statusColors[index % statusColors.length]}
                        key={entry.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 grid gap-1.5">
            {statusData.map((item, index) => (
              <div className="flex items-center justify-between text-xs" key={item.name}>
                <span className="flex items-center gap-2 text-luxury-text">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: statusColors[index % statusColors.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-3">
            <p className="premium-eyebrow">Produits</p>
            <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
              Plus vendus
            </h2>
          </div>
          <div className="h-56 sm:h-60">
            {topProducts.length === 0 ? (
              <ChartFallback message="Les donnees des produits les plus vendus ne sont pas encore exposees par l'endpoint dashboard." />
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={topProducts} margin={{ bottom: 8, left: -20, right: 8 }}>
                  <CartesianGrid stroke="#E8DED0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#6B6B6B", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6B6B6B", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#C8A24A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-3">
            <p className="premium-eyebrow">Clients</p>
            <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
              Nouveaux clients
            </h2>
          </div>
          <div className="h-56 sm:h-60">
            {newClientsByMonth.length === 0 ? (
              <ChartFallback message="Les nouveaux clients par mois ne sont pas encore fournis par l'endpoint dashboard." />
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={newClientsByMonth} margin={{ bottom: 8, left: -20, right: 8 }}>
                  <CartesianGrid stroke="#E8DED0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#6B6B6B", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6B6B6B", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0B0B0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
