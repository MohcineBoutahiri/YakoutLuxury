"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { Stars } from "@/components/product/ProductRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { reviewService } from "@/services/review.service";
import type { ReviewSummary } from "@/types/review";

type ProductReviewsProps = {
  productSlug: string;
};

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function loadReviews() {
    reviewService
      .getProductReviews(productSlug)
      .then(setSummary)
      .catch(() =>
        setSummary({
          productId: "",
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
        }),
      );
  }

  useEffect(loadReviews, [productSlug]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isAuthenticated) {
      showToast("error", "Connectez-vous pour ajouter un avis.");
      router.push("/login");
      return;
    }

    if (comment.length > 800) {
      const message = "Le commentaire ne doit pas depasser 800 caracteres.";
      setError(message);
      showToast("error", message);
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewService.createReview(productSlug, {
        rating,
        comment: comment.trim() || undefined,
      });
      setComment("");
      setRating(5);
      setIsModalOpen(false);
      showToast("success", "Avis envoye. Il sera visible apres validation.");
      loadReviews();
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const approvedReviews = (summary?.reviews ?? []).filter(
    (review) => !review.status || review.status === "APPROVED",
  );
  const averageRating = summary?.averageRating ?? 0;
  const totalReviews = approvedReviews.length || summary?.totalReviews || 0;

  return (
    <section className="mt-6 rounded-md border border-luxury-beige bg-white/95 p-4 shadow-luxury-soft sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="premium-eyebrow">Avis clients</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            Retours approuves
          </h2>
        </div>
        {isAuthenticated ? (
          <Button className="h-10 px-4" onClick={() => setIsModalOpen(true)} variant="black">
            Donner mon avis
          </Button>
        ) : (
          <Button className="h-10 px-4" onClick={() => router.push("/login")} variant="soft">
            Connectez-vous pour donner un avis
          </Button>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="h-fit rounded-md border border-luxury-beige bg-luxury-ivory/65 p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-luxury-text">
            Note moyenne
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-heading text-4xl font-semibold">
              {averageRating ? averageRating.toFixed(1) : "0.0"}
            </span>
            <span className="pb-1 text-xs text-luxury-text">/ 5</span>
          </div>
          <div className="mt-2">
            <Stars value={averageRating} />
          </div>
          <p className="mt-2 text-sm text-luxury-text">
            {totalReviews} avis approuve(s)
          </p>
        </div>

        {approvedReviews.length === 0 ? (
          <EmptyState
            description="Les avis approuves apparaitront ici apres validation."
            title="Aucun avis approuve"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {approvedReviews.slice(0, 6).map((review) => (
              <Card className="bg-white/95 shadow-none" key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-luxury-black text-luxury-gold">
                        <MessageSquare size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-luxury-text">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.comment ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-luxury-text">
                      {review.comment}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-luxury-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-md border border-luxury-beige bg-white shadow-luxury">
            <div className="flex items-center justify-between border-b border-luxury-beige px-5 py-4">
              <div>
                <p className="premium-eyebrow">Avis</p>
                <h3 className="font-heading text-2xl font-semibold">
                  Donner mon avis
                </h3>
              </div>
              <Button aria-label="Fermer" onClick={() => setIsModalOpen(false)} size="icon" variant="ghost">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form className="grid max-h-[calc(90dvh-82px)] gap-4 overflow-y-auto p-5" onSubmit={handleSubmit}>
              <label className="block text-sm text-luxury-black">
                <span className="mb-2 block font-medium">Votre note</span>
                <select
                  className="h-11 w-full rounded-md border border-luxury-beige bg-white px-3 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
                  onChange={(event) => setRating(Number(event.target.value))}
                  value={rating}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} / 5
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-luxury-black">
                <span className="mb-2 block font-medium">Commentaire</span>
                <textarea
                  className="min-h-28 w-full rounded-md border border-luxury-beige bg-white px-3 py-3 text-luxury-black outline-none transition placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
                  maxLength={800}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Votre experience avec cette piece"
                  value={comment}
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button onClick={() => setIsModalOpen(false)} type="button" variant="soft">
                  Annuler
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
