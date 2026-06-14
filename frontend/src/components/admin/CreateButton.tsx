"use client";

import { Plus } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";

type CreateButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function CreateButton({ label, ...props }: CreateButtonProps) {
  return (
    <Button className="h-9 px-3 text-xs" size="sm" {...props}>
      <Plus size={15} />
      {label}
    </Button>
  );
}
