import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ContainerSize = "md" | "lg" | "xl" | "full";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

const sizes: Record<ContainerSize, string> = {
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  className,
  size = "xl",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", sizes[size], className)}
      {...props}
    />
  );
}
