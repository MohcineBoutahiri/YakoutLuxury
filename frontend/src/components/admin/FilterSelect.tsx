"use client";

type FilterSelectProps = {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
};

export function FilterSelect({
  label,
  onChange,
  options,
  value,
}: FilterSelectProps) {
  return (
    <label className="block text-sm text-luxury-black">
      <span className="mb-2 block font-medium">{label}</span>
      <select
        className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
