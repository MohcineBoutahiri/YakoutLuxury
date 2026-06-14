import type { ReactNode } from "react";
import { AdminCard, AdminCardContent } from "@/components/admin/AdminCard";
import { cn } from "@/lib/cn";

type TableToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function TableToolbar({ children, className }: TableToolbarProps) {
  return (
    <AdminCard className="mb-5">
      <AdminCardContent
        className={cn("grid gap-4 md:items-end", className)}
      >
        {children}
      </AdminCardContent>
    </AdminCard>
  );
}
