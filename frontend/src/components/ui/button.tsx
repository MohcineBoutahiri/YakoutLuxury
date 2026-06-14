import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant =
  | "primary"
  | "gold"
  | "outline"
  | "dark"
  | "black"
  | "ghost"
  | "soft";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-luxury-gold bg-luxury-gold text-luxury-black shadow-luxury-gold hover:bg-luxury-black hover:text-luxury-ivory",
  gold:
    "border-luxury-gold bg-luxury-gold text-luxury-black shadow-luxury-gold hover:bg-luxury-black hover:text-luxury-ivory",
  outline:
    "border-luxury-gold bg-transparent text-luxury-ivory hover:bg-luxury-gold hover:text-luxury-black",
  dark: "border-luxury-black bg-luxury-black text-luxury-ivory hover:border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black",
  black:
    "border-luxury-black bg-luxury-black text-luxury-ivory hover:border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black",
  ghost:
    "border-transparent bg-transparent text-luxury-black hover:border-luxury-beige hover:bg-luxury-beige/55",
  soft:
    "border-luxury-beige bg-luxury-ivory text-luxury-black hover:border-luxury-gold hover:bg-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11 p-0 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium tracking-[0.01em] transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-gold",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
