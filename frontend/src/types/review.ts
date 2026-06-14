export type ReviewUser = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  status?: ReviewStatus;
  createdAt: string;
  user: ReviewUser;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ReviewSummary = {
  productId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
};

export type CreateReviewPayload = {
  rating: number;
  comment?: string;
};
