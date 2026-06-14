"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error";

type ToastState = {
  id: number;
  type: ToastType;
  message: string;
} | null;

type ToastContextValue = {
  toast: ToastState;
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToast({ id, type, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ toast, showToast }), [showToast, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          aria-live="polite"
          className="fixed bottom-5 left-5 right-5 z-50 border border-luxury-beige bg-luxury-black px-5 py-4 text-sm text-luxury-ivory shadow-luxury sm:left-auto sm:max-w-sm"
          role="status"
        >
          <span className="font-medium text-luxury-gold">
            {toast.type === "success" ? "Succes" : "Erreur"}
          </span>
          <p className="mt-1 leading-6">{toast.message}</p>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit etre utilise dans ToastProvider.");
  }

  return context;
}
