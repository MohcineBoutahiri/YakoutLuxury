import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertProps = {
  children: ReactNode;
  tone?: "error" | "info" | "success";
  className?: string;
};

const tones = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-luxury-beige bg-luxury-ivory text-luxury-text",
  success: "border-luxury-gold/40 bg-luxury-gold/10 text-luxury-black",
};

export function Alert({ children, className, tone = "info" }: AlertProps) {
  return (
    <div className={cn("border px-4 py-3 text-sm leading-6", tones[tone], className)} role="alert">
      {children}
    </div>
  );
}
