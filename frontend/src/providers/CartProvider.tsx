"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiErrorMessage } from "@/services/api";
import { cartService } from "@/services/cart.service";
import type { AddToCartPayload, Cart } from "@/types/cart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";

type CartContextValue = {
  cart: Cart | null;
  totalQuantity: number;
  isLoading: boolean;
  fetchCart: () => Promise<Cart | null>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  showToast: (type: "success" | "error", message: string) => void;
};

export const CartContext = createContext<CartContextValue | undefined>(
  undefined,
);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }

    setIsLoading(true);

    try {
      const nextCart = await cartService.fetchCart();
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      showToast("error", getApiErrorMessage(error));
      setCart(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      try {
        const nextCart = await cartService.addToCart(payload);
        setCart(nextCart);
        showToast("success", "Produit ajoute au panier.");
      } catch (error) {
        showToast("error", getApiErrorMessage(error));
        throw error;
      }
    },
    [showToast],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const nextCart = await cartService.updateQuantity(itemId, { quantity });
        setCart(nextCart);
        showToast("success", "Quantite mise a jour.");
      } catch (error) {
        showToast("error", getApiErrorMessage(error));
      }
    },
    [showToast],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const nextCart = await cartService.removeItem(itemId);
        setCart(nextCart);
        showToast("success", "Article retire du panier.");
      } catch (error) {
        showToast("error", getApiErrorMessage(error));
      }
    },
    [showToast],
  );

  const clearCart = useCallback(async () => {
    try {
      const nextCart = await cartService.clearCart();
      setCart(nextCart);
      showToast("success", "Panier vide.");
    } catch (error) {
      showToast("error", getApiErrorMessage(error));
    }
  }, [showToast]);

  const resetCart = useCallback(() => {
    setCart(null);
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (isAuthenticated) {
      void fetchCart();
    } else {
      setCart(null);
    }
  }, [fetchCart, isAuthenticated, isAuthLoading]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalQuantity: cart?.totalQuantity ?? 0,
      isLoading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      resetCart,
      showToast,
    }),
    [
      addToCart,
      cart,
      clearCart,
      fetchCart,
      isLoading,
      removeItem,
      resetCart,
      showToast,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
