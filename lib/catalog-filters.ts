import type { Product, Variant } from "@prisma/client";

export type CatalogProduct = Product & { variants: Variant[] };
export type CatalogSearch = Record<string, string | undefined>;

export const PAGE_SIZE = 12;

export const priceRanges = [
  {
    key: "hasta-1000",
    label: "Hasta S/ 1,000",
    short: "Hasta S/ 1,000",
    min: 0,
    max: 100000,
  },
  {
    key: "1000-2000",
    label: "S/ 1,000 a S/ 2,000",
    short: "S/ 1,000–2,000",
    min: 100000,
    max: 200000,
  },
  {
    key: "2000-3500",
    label: "S/ 2,000 a S/ 3,500",
    short: "S/ 2,000–3,500",
    min: 200000,
    max: 350000,
  },
  {
    key: "desde-3500",
    label: "Más de S/ 3,500",
    short: "Más de S/ 3,500",
    min: 350000,
    max: null,
  },
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

const hasStock = (product: CatalogProduct) =>
  product.variants.some((v) => v.stock > 0);

const inPriceRange = (
  product: CatalogProduct,
  range: (typeof priceRanges)[number],
) =>
  product.variants.some((v) => {
    const cents = v.salePriceCents ?? v.priceCents;
    return cents >= range.min && (range.max === null || cents < range.max);
  });

/**
 * Checks a product against every active filter. `ignore` skips one dimension,
 * which is how facet counters show "what would happen if I picked this".
 */
export function matchesSearch(
  product: CatalogProduct,
  search: CatalogSearch,
  ignore?: string,
) {
  const term = (search.q || "").trim().toLowerCase();
  const range = priceRanges.find((r) => r.key === search.precio);
  if (ignore !== "marca" && search.marca && product.brand !== search.marca)
    return false;
  if (term && !`${product.brand} ${product.model}`.toLowerCase().includes(term))
    return false;
  if (
    ignore !== "almacenamiento" &&
    search.almacenamiento &&
    !product.variants.some((v) => v.storage === search.almacenamiento)
  )
    return false;
  if (
    ignore !== "ram" &&
    search.ram &&
    !product.variants.some((v) => v.ram === search.ram)
  )
    return false;
  if (ignore !== "precio" && range && !inPriceRange(product, range))
    return false;
  if (
    ignore !== "disponible" &&
    search.disponible === "1" &&
    !hasStock(product)
  )
    return false;
  if (
    ignore !== "disponible" &&
    search.disponible === "agotado" &&
    hasStock(product)
  )
    return false;
  return true;
}

export type CatalogFacets = {
  total: number;
  available: number;
  soldOut: number;
  brands: Record<string, number>;
  storages: Record<string, number>;
  rams: Record<string, number>;
  prices: Record<string, number>;
};

/**
 * Result count per filter option, so the UI can hide dead ends before the user
 * taps them. Each dimension ignores its own filter to keep options reachable.
 */
export function catalogFacets(
  products: CatalogProduct[],
  search: CatalogSearch,
): CatalogFacets {
  const count = (ignore?: string, test?: (p: CatalogProduct) => boolean) =>
    products.filter(
      (p) => (!test || test(p)) && matchesSearch(p, search, ignore),
    ).length;
  const tally = (
    values: string[],
    ignore: string,
    test: (value: string) => (p: CatalogProduct) => boolean,
  ) => Object.fromEntries(values.map((v) => [v, count(ignore, test(v))]));

  return {
    total: count(),
    available: count("disponible", hasStock),
    soldOut: count("disponible", (p) => !hasStock(p)),
    brands: tally(
      [...new Set(products.map((p) => p.brand))],
      "marca",
      (brand) => (p) => p.brand === brand,
    ),
    storages: tally(
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.storage)))],
      "almacenamiento",
      (storage) => (p) => p.variants.some((v) => v.storage === storage),
    ),
    rams: tally(
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.ram)))],
      "ram",
      (ram) => (p) => p.variants.some((v) => v.ram === ram),
    ),
    prices: Object.fromEntries(
      priceRanges.map((range) => [
        range.key,
        count("precio", (p) => inPriceRange(p, range)),
      ]),
    ),
  };
}

export function filterCatalog(
  products: CatalogProduct[],
  search: CatalogSearch,
) {
  const items = products.filter((product) => matchesSearch(product, search));

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

/** Same url with one filter toggled off (or on) and the page reset. */
export function toggleHref(search: CatalogSearch, key: string, value: string) {
  const next = { ...search };
  if (next[key] === value) delete next[key];
  else next[key] = value;
  return catalogHref(next);
}
