"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminFilterActions,
  AdminFilterBar,
  AdminFilterDate,
  AdminFilterInput,
  AdminFilterSearch,
} from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { ActivityLog } from "@/types/admin";

const pageSize = 20;

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [adminId, setAdminId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const loadLogs = useCallback(() => {
    setIsLoading(true);
    setError("");
    adminService
      .getActivityLogs({
        action: action.trim() || undefined,
        entity: entity.trim() || undefined,
        adminId: adminId.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: pageSize,
      })
      .then((response) => {
        setLogs(response.data);
        setTotalPages(response.meta?.totalPages ?? 1);
      })
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }, [action, adminId, dateFrom, dateTo, entity, page, showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(loadLogs, 250);
    return () => window.clearTimeout(timeout);
  }, [loadLogs]);

  useEffect(() => {
    setPage(1);
  }, [action, adminId, dateFrom, dateTo, entity]);

  function resetFilters() {
    setAction("");
    setEntity("");
    setAdminId("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <AdminLayout title="Logs d'activite">
      <AdminFilterBar
        actions={<AdminFilterActions onFilter={loadLogs} onReset={resetFilters} />}
        className="xl:[grid-template-columns:minmax(170px,1fr)_minmax(150px,0.85fr)_minmax(160px,0.9fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_auto]"
      >
        <AdminFilterSearch
          label="Action"
          onChange={(event) => setAction(event.target.value)}
          placeholder="UPDATE_PRODUCT"
          value={action}
        />
        <AdminFilterInput
          label="Entite"
          onChange={(event) => setEntity(event.target.value)}
          placeholder="Product, Category..."
          value={entity}
        />
        <AdminFilterInput
          label="Admin"
          onChange={(event) => setAdminId(event.target.value)}
          placeholder="ID admin"
          value={adminId}
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
      ) : logs.length === 0 ? (
        <EmptyState
          description="Les actions admin importantes apparaitront ici."
          title="Aucun log"
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden lg:block">
            <AdminTable
              headers={["Date", "Admin", "Action", "Entite", "Description", "IP"]}
              minWidth="1080px"
            >
              {logs.map((log) => (
                <tr className="border-b border-luxury-beige" key={log.id}>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {log.admin ? (
                      <div>
                        <p className="font-semibold">
                          {log.admin.firstName} {log.admin.lastName}
                        </p>
                        <p className="mt-1 text-xs text-luxury-text">
                          {log.admin.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-luxury-text">Admin supprime</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="gold">{log.action}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="light">{log.entity}</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {log.description ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {log.ipAddress ?? "-"}
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="gold">{log.action}</Badge>
                    <Badge variant="light">{log.entity}</Badge>
                  </div>
                  <p className="mt-3 font-medium">
                    {log.admin
                      ? `${log.admin.firstName} ${log.admin.lastName}`
                      : "Admin supprime"}
                  </p>
                  <p className="mt-1 text-sm text-luxury-text">
                    {log.description ?? "-"}
                  </p>
                  <p className="mt-3 text-xs text-luxury-text">
                    {formatDate(log.createdAt)} | IP {log.ipAddress ?? "-"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination onPageChange={setPage} page={page} totalPages={totalPages} />
        </div>
      )}
    </AdminLayout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
