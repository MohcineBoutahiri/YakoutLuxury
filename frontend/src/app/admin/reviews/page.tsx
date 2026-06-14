"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import {
  AdminFilterActions,
  AdminFilterBar,
  AdminFilterSearch,
  AdminFilterSelect,
} from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DataTable } from "@/components/admin/DataTable";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Review, ReviewStatus } from "@/types/review";

const reviewStatuses: Array<[ReviewStatus | "", string]> = [
  ["", "Tous"],
  ["PENDING", "En attente"],
  ["APPROVED", "Approuves"],
  ["REJECTED", "Rejetes"],
];

function getClientLabel(review: Review) {
  return `${review.user.firstName} ${review.user.lastName}`;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (!query) {
        return true;
      }

      return (
        getClientLabel(review).toLowerCase().includes(query) ||
        (review.user.email ?? "").toLowerCase().includes(query) ||
        (review.product?.name ?? "").toLowerCase().includes(query) ||
        (review.comment ?? "").toLowerCase().includes(query)
      );
    });
  }, [reviews, search]);

  function loadReviews() {
    setIsLoading(true);
    setError("");
    adminService
      .getReviews({ status: status || undefined, limit: 100 })
      .then((response) => setReviews(response.data))
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadReviews, []);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setIsLoading(true);
    adminService
      .getReviews({ limit: 100 })
      .then((response) => setReviews(response.data))
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  async function updateStatus(id: string, nextStatus: ReviewStatus) {
    setActionId(id);
    try {
      const updatedReview = await adminService.updateReviewStatus(id, nextStatus);
      setReviews((current) =>
        current.map((review) => (review.id === updatedReview.id ? updatedReview : review)),
      );
      showToast("success", "Statut de l'avis mis a jour.");
    } catch (updateError) {
      showToast("error", getApiErrorMessage(updateError));
    } finally {
      setActionId(null);
    }
  }

  async function deleteReview() {
    if (!deleteId) {
      return;
    }

    setActionId(deleteId);
    try {
      await adminService.deleteReview(deleteId);
      setReviews((current) => current.filter((review) => review.id !== deleteId));
      setDeleteId(null);
      showToast("success", "Avis supprime.");
    } catch (deleteError) {
      showToast("error", getApiErrorMessage(deleteError));
    } finally {
      setActionId(null);
    }
  }

  return (
    <AdminLayout title="Avis">
      <AdminFilterBar
        actions={<AdminFilterActions onFilter={loadReviews} onReset={resetFilters} />}
        className="xl:[grid-template-columns:minmax(220px,1fr)_minmax(150px,0.55fr)_auto]"
      >
        <AdminFilterSearch
          label="Recherche"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Client, produit ou commentaire"
          value={search}
        />
        <AdminFilterSelect
          label="Statut"
          onValueChange={(value) => setStatus(value as ReviewStatus | "")}
          options={reviewStatuses}
          value={status}
        />
      </AdminFilterBar>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          description="Aucun avis ne correspond aux filtres actuels."
          title="Aucun avis"
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable
              headers={["Date", "Client", "Produit", "Note", "Commentaire", "Statut", "Actions"]}
              minWidth="1060px"
            >
              {filteredReviews.map((review) => (
                <tr className="border-b border-luxury-beige" key={review.id}>
                  <td className="px-5 py-4 text-luxury-text">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{getClientLabel(review)}</p>
                    <p className="mt-1 text-xs text-luxury-text">{review.user.email}</p>
                  </td>
                  <td className="px-5 py-4">{review.product?.name ?? "-"}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="fill-luxury-gold text-luxury-gold" size={15} />
                      {review.rating}/5
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-luxury-text">
                    {review.comment ?? "-"}
                  </td>
                  <td className="px-5 py-4">
                    <ReviewStatusBadge status={review.status ?? "PENDING"} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <IconActionButton
                        disabled={actionId === review.id}
                        icon={<Check size={15} />}
                        label="Approuver"
                        onClick={() => updateStatus(review.id, "APPROVED")}
                      />
                      <IconActionButton
                        disabled={actionId === review.id}
                        icon={<X size={15} />}
                        label="Rejeter"
                        onClick={() => updateStatus(review.id, "REJECTED")}
                        variant="danger"
                      />
                      <IconActionButton
                        disabled={actionId === review.id}
                        icon={<Trash2 size={15} />}
                        label="Supprimer"
                        onClick={() => setDeleteId(review.id)}
                        variant="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">
                        {review.product?.name ?? "Produit"}
                      </h3>
                      <p className="mt-1 text-sm text-luxury-text">
                        {getClientLabel(review)} - {review.rating}/5
                      </p>
                    </div>
                    <ReviewStatusBadge status={review.status ?? "PENDING"} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-luxury-text">
                    {review.comment ?? "-"}
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <IconActionButton
                      icon={<Check size={15} />}
                      label="Approuver"
                      onClick={() => updateStatus(review.id, "APPROVED")}
                    />
                    <IconActionButton
                      icon={<X size={15} />}
                      label="Rejeter"
                      onClick={() => updateStatus(review.id, "REJECTED")}
                      variant="danger"
                    />
                    <IconActionButton
                      icon={<Trash2 size={15} />}
                      label="Supprimer"
                      onClick={() => setDeleteId(review.id)}
                      variant="danger"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        confirmLabel="Supprimer"
        description="Cette action supprimera definitivement cet avis."
        isLoading={Boolean(deleteId && actionId === deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={deleteReview}
        open={Boolean(deleteId)}
        title="Supprimer l'avis ?"
      />
    </AdminLayout>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  if (status === "APPROVED") {
    return <StatusBadge label="Approuve" status="ACTIVE" />;
  }

  if (status === "REJECTED") {
    return <StatusBadge label="Rejete" status="CANCELLED" />;
  }

  return <StatusBadge label="En attente" status="PENDING" />;
}
