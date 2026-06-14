export type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BannerFormPayload = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position?: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
};
