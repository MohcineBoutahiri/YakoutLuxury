export function normalizeSizeLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

export function normalizeColorLabel(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function uniqueNormalizedSizes(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map(normalizeSizeLabel))).sort();
}

export function uniqueNormalizedColors(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map(normalizeColorLabel))).sort();
}
