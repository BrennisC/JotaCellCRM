export type Page<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
};

/** Slices a list in pages, clamping the requested page to the available range. */
export function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Number.isSafeInteger(page)
    ? Math.min(Math.max(page, 1), pages)
    : 1;
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pages,
    total: items.length,
  };
}

/** Page numbers to render, with gaps marked by zero. */
export function pageWindow(page: number, pages: number) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const numbers = new Set([1, pages, page - 1, page, page + 1]);
  const sorted = [...numbers]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return sorted.flatMap((n, i) =>
    i > 0 && n - sorted[i - 1] > 1 ? [0, n] : [n],
  );
}
