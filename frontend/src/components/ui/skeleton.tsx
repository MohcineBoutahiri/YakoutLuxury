import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-luxury-beige/60 via-white to-luxury-beige/60",
        className,
      )}
    />
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div className="overflow-hidden rounded-md border border-luxury-beige bg-white shadow-luxury-soft" key={index}>
          <Skeleton className="aspect-[5/4] rounded-none" />
          <div className="grid gap-1.5 p-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-2 w-14" />
              <Skeleton className="h-2 w-9" />
            </div>
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-20" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-7 w-7" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="min-h-[104px] rounded-md border border-luxury-beige bg-white p-4 shadow-luxury-soft" key={index}>
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-64 border border-luxury-beige bg-white" />
        <Skeleton className="h-64 border border-luxury-beige bg-white" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-64 border border-luxury-beige bg-white" />
        <Skeleton className="h-64 border border-luxury-beige bg-white" />
      </div>
    </div>
  );
}
