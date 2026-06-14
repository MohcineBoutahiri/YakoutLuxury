import { api } from "@/services/api";
import type { CreateOrderPayload, Order } from "@/types/order";

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const { data } = await api.post<Order>("/orders", payload);
    return data;
  },

  async getMyOrders() {
    const { data } = await api.get<Order[]>("/orders/my-orders");
    return data;
  },

  async getOrderById(id: string) {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },
};

