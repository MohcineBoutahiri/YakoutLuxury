"use client";

import Link from "next/link";
import type { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { cn } from "@/lib/cn";

type IconActionButtonProps = {
  label: string;
  icon: ReactNode;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
};

const baseClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition focus:outline-none focus:ring-2 focus:ring-luxury-gold/30";

const variantClasses = {
  default:
    "border-luxury-beige bg-white text-luxury-text hover:border-luxury-gold hover:bg-luxury-ivory hover:text-luxury-black",
  danger:
    "border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 hover:text-red-800",
};

const disabledClasses = "pointer-events-none cursor-not-allowed opacity-45";

export function IconActionButton({
  disabled,
  href,
  icon,
  label,
  onClick,
  target,
  variant = "default",
}: IconActionButtonProps) {
  const className = cn(
    baseClasses,
    variantClasses[variant],
    disabled && disabledClasses,
  );

  if (href) {
    return (
      <Link
        aria-disabled={disabled}
        aria-label={label}
        className={className}
        href={href}
        rel={target === "_blank" ? "noreferrer" : undefined}
        target={target}
        title={label}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}
