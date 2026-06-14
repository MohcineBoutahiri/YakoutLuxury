export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-luxury-beige bg-white">
      <div className="grid gap-0">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            className="grid grid-cols-4 gap-4 border-b border-luxury-beige p-5 last:border-b-0"
            key={index}
          >
            <span className="h-4 animate-pulse rounded bg-luxury-beige/70" />
            <span className="h-4 animate-pulse rounded bg-luxury-beige/60" />
            <span className="h-4 animate-pulse rounded bg-luxury-beige/50" />
            <span className="h-4 animate-pulse rounded bg-luxury-beige/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
