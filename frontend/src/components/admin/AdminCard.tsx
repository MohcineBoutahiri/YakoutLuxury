import type { HTMLAttributes } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function AdminCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        "border-luxury-beige/80 bg-white shadow-[0_18px_45px_rgba(11,11,11,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function AdminCardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <CardHeader className={cn("px-5 py-4 sm:px-6", className)} {...props} />;
}

export function AdminCardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <CardTitle className={cn("text-2xl sm:text-3xl", className)} {...props} />;
}

export function AdminCardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <CardContent className={cn("p-5 sm:p-6", className)} {...props} />;
}
