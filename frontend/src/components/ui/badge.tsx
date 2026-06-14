import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "gold" | "dark" | "light" | "success" | "danger" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  gold: "border-luxury-gold/60 bg-luxury-gold/15 text-luxury-gold",
  dark: "border-luxury-black bg-luxury-black text-luxury-ivory",
  light: "border-luxury-beige bg-luxury-ivory text-luxury-black",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  muted: "border-luxury-beige bg-white text-luxury-text",
};

export function Badge({ className, variant = "light", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
