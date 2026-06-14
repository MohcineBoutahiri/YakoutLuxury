import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ onPageChange, page, totalPages }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        variant="soft"
      >
        Precedent
      </Button>
      <span className="text-sm text-luxury-text">
        Page {page} / {Math.max(totalPages, 1)}
      </span>
      <Button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        variant="soft"
      >
        Suivant
      </Button>
    </div>
  );
}
