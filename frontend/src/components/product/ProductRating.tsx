"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { reviewService } from "@/services/review.service";

type ProductRatingProps = {
  className?: string;
  compact?: boolean;
  initialAverageRating?: number | null;
  initialTotalReviews?: number | null;
  productSlug: string;
};

type RatingState = {
  averageRating: number;
  totalReviews: number;
};

export function ProductRating({
  className,
  compact = false,
  initialAverageRating = 0,
  initialTotalReviews = 0,
  productSlug,
}: ProductRatingProps) {
  const [rating, setRating] = useState<RatingState>({
    averageRating: initialAverageRating ?? 0,
    totalReviews: initialTotalReviews ?? 0,
  });

  useEffect(() => {
    let isMounted = true;

    if ((initialTotalReviews ?? 0) > 0 && (initialAverageRating ?? 0) > 0) {
      return () => {
        isMounted = false;
      };
    }

    reviewService
      .getProductReviews(productSlug)
      .then((summary) => {
        if (isMounted) {
          setRating({
            averageRating: summary.averageRating,
            totalReviews: summary.totalReviews,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setRating({ averageRating: 0, totalReviews: 0 });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialAverageRating, initialTotalReviews, productSlug]);

  const hasReviews = rating.totalReviews > 0 && rating.averageRating > 0;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <Stars value={rating.averageRating} />
      <span className="font-semibold text-luxury-black">
        {hasReviews ? rating.averageRating.toFixed(1) : "Aucun avis"}
      </span>
      {hasReviews ? (
        <span className="text-luxury-text">
          {compact ? `(${rating.totalReviews})` : `${rating.totalReviews} avis`}
        </span>
      ) : null}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  const roundedValue = Math.round(value);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          className={
            star <= roundedValue
              ? "fill-luxury-gold text-luxury-gold"
              : "fill-transparent text-luxury-beige"
          }
          key={star}
          size={15}
        />
      ))}
    </span>
  );
}
