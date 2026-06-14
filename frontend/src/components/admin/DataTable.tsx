import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  className?: string;
  minWidth?: string;
};

export function DataTable({
  children,
  className,
  headers,
  minWidth = "760px",
}: DataTableProps) {
  return (
    <Card
      className={cn(
        "overflow-x-auto border-luxury-beige/80 bg-white shadow-[0_18px_45px_rgba(11,11,11,0.06)]",
        "[&_tbody_tr]:transition [&_tbody_tr:hover]:bg-luxury-ivory/45 [&_tbody_tr:last-child]:border-b-0",
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <thead className="border-b border-luxury-beige bg-luxury-ivory/75 text-xs uppercase tracking-[0.05em] text-luxury-text">
          <tr>
            {headers.map((header) => (
              <th className="whitespace-nowrap px-5 py-4 font-semibold" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </Card>
  );
}
