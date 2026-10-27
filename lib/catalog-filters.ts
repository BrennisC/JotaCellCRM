import type { Product, Variant } from "@prisma/client";

export type CatalogProduct = Product & { variants: Variant[] };
export type CatalogSearch = Record<string, string | undefined>;

export const PAGE_SIZE = 12;

export const priceRanges = [
  { key: "hasta-1000", label: "Hasta S/ 1,000", min: 0, max: 100000 },
  { key: "1000-2000", label: "S/ 1,000 a S/ 2,000", min: 100000, max: 200000 },
  {
    key: "2000-3500",
    label: "S/ 2,000 a S/ 3,500",
    min: 200000,
    max: 350000,
  },
  { key: "desde-3500", label: "Más de S/ 3,500", min: 350000, max: null },
];

export const sortOptions = [
  { key: "recientes", label: "Más recientes" },
  { key: "precio-asc", label: "Menor precio" },
  { key: "precio-desc", label: "Mayor precio" },
];

/** Visible price of a product: the cheapest variant, offers included. */
export const cheapestPrice = (product: CatalogProduct) =>
  product.variants.length
    ? Math.min(...product.variants.map((v) => v.salePriceCents ?? v.priceCents))
    : Number.POSITIVE_INFINITY;

const storageSize = (value: string) => {
  const match = value.match(/([\d.]+)\s*(GB|TB)/i);
  if (!match) return Number.POSITIVE_INFINITY;
  const amount = Number(match[1]);
  return match[2].toUpperCase() === "TB" ? amount * 1024 : amount;
};

export const sortStorages = (values: string[]) =>
  [...new Set(values)].sort(
    (a, b) => storageSize(a) - storageSize(b) || a.localeCompare(b),
  );

export function filterCatalog(
  products: CatalogProduct[],
  search: CatalogSearch,
) {
  const term = (search.q || "").trim().toLowerCase();
  const range = priceRanges.find((r) => r.key === search.precio);
  const items = products.filter((product) => {
    if (search.marca && product.brand !== search.marca) return false;
    if (search.condicion && product.condition !== search.condicion)
      return false;
    if (
      term &&
      !`${product.brand} ${product.model}`.toLowerCase().includes(term)
    )
      return false;
    if (
      search.almacenamiento &&
      !product.variants.some((v) => v.storage === search.almacenamiento)
    )
      return false;
    if (search.ram && !product.variants.some((v) => v.ram === search.ram))
      return false;
    if (
      range &&
      !product.variants.some((v) => {
        const cents = v.salePriceCents ?? v.priceCents;
        return cents >= range.min && (range.max === null || cents < range.max);
      })
    )
      return false;
    if (search.disponible === "1" && !product.variants.some((v) => v.stock > 0))
      return false;
    if (
      search.disponible === "agotado" &&
      product.variants.some((v) => v.stock > 0)
    )
      return false;
    return true;
  });

  const sort =
    sortOptions.find((o) => o.key === search.orden)?.key || "recientes";
  const sorted =
    sort === "recientes"
      ? items
      : items.sort((a, b) =>
          sort === "precio-asc"
            ? cheapestPrice(a) - cheapestPrice(b)
            : cheapestPrice(b) - cheapestPrice(a),
        );

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const requested = Number(search.pagina);
  const page = Number.isSafeInteger(requested)
    ? Math.min(Math.max(requested, 1), pages)
    : 1;
  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    page,
    pages,
    sort,
  };
}

/** Builds a catalog url keeping the active filters and changing only the page. */
export function catalogHref(search: CatalogSearch, page = 1) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    if (value && key !== "pagina") params.set(key, value);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `/celulares?${query}` : "/celulares";
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
