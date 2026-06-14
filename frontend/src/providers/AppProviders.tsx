"use client";

import type { ReactNode } from "react";
import { RouteAccessRedirect } from "@/components/auth/RouteAccessRedirect";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { ToastProvider } from "@/providers/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <RouteAccessRedirect />
          {children}
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
