import { api } from "@/services/api";
import type {
  AddToCartPayload,
  Cart,
  UpdateCartItemPayload,
} from "@/types/cart";

export const cartService = {
  async fetchCart() {
    const { data } = await api.get<Cart>("/cart");
    return data;
  },

  async addToCart(payload: AddToCartPayload) {
    const { data } = await api.post<Cart>("/cart/add", payload);
    return data;
  },

  async updateQuantity(itemId: string, payload: UpdateCartItemPayload) {
    const { data } = await api.put<Cart>(`/cart/items/${itemId}`, payload);
    return data;
  },

  async removeItem(itemId: string) {
    const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
    return data;
  },

  async clearCart() {
    const { data } = await api.delete<Cart>("/cart/clear");
    return data;
  },
};

