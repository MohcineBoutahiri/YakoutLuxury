import { api } from "@/services/api";
import type { Banner } from "@/types/banner";

export const bannerService = {
  async getActiveBanners() {
    const { data } = await api.get<Banner[]>("/banners");
    return data;
  },
};
