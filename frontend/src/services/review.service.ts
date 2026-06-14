import { api } from "@/services/api";
import type { CreateReviewPayload, Review, ReviewSummary } from "@/types/review";

export const reviewService = {
  async getProductReviews(slug: string) {
    const { data } = await api.get<ReviewSummary>(`/products/${slug}/reviews`);
    return data;
  },

  async createReview(slug: string, payload: CreateReviewPayload) {
    const { data } = await api.post<Review>(`/products/${slug}/reviews`, payload);
    return data;
  },
};
