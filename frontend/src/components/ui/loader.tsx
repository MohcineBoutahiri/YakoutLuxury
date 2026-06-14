import { cn } from "@/lib/cn";

type LoaderProps = {
  label?: string;
  className?: string;
};

export function Loader({ label = "Chargement", className }: LoaderProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-luxury-beige bg-white/80 px-4 py-2 text-sm text-luxury-text shadow-luxury-soft",
        className,
      )}
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-luxury-beige border-t-luxury-gold" />
      <span>{label}</span>
    </div>
  );
}
