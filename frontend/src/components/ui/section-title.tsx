import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionTitleProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionTitle({
  action,
  align = "left",
  className,
  description,
  eyebrow,
  title,
}: SectionTitleProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        isCentered && "mx-auto max-w-3xl text-center md:block",
        className,
      )}
    >
      <div className={cn(isCentered && "mx-auto")}>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-luxury-gold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight text-luxury-black sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl leading-8 text-luxury-text">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn(isCentered && "mt-6")}>{action}</div> : null}
    </div>
  );
}
