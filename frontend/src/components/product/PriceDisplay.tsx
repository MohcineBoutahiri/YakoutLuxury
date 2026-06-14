import { cn } from "@/lib/cn";

type PriceDisplayProps = {
  price: string | number;
  oldPrice?: string | number | null;
  className?: string;
};

const formatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export function PriceDisplay({ price, oldPrice, className }: PriceDisplayProps) {
  const currentPrice = toNumber(price);
  const previousPrice = oldPrice ? toNumber(oldPrice) : null;

  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className="font-medium text-current">
        {formatter.format(currentPrice)}
      </span>
      {previousPrice ? (
        <span className="text-sm text-luxury-text line-through">
          {formatter.format(previousPrice)}
        </span>
      ) : null}
    </div>
  );
}
