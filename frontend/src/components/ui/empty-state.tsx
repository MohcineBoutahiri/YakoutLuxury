import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="bg-white/90">
      <CardContent className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-luxury-gold/40 bg-luxury-gold/10">
          <span className="h-8 w-px bg-luxury-gold" />
        </div>
        <h2 className="font-heading text-3xl font-semibold">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-md leading-7 text-luxury-text">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
