import { expect, test } from "bun:test";
import type { Variant } from "@prisma/client";
import {
  catalogFacets,
  catalogHref,
  cheapestPrice,
  filterCatalog,
  sortStorages,
  toggleHref,
  type CatalogProduct,
} from "./catalog-filters";
import { pageWindow } from "./pagination";

let counter = 0;
const make = (
  brand: string,
  model: string,
  variants: Partial<Variant>[],
  createdAt = new Date(2026, 0, 1),
): CatalogProduct =>
  ({
    id: `p${++counter}`,
    slug: `${brand}-${model}`.toLowerCase(),
    brand,
    model,
    description: "",
    warranty: "12 meses",
    condition: "Nuevo",
    published: true,
    featured: false,
    images: [],
    specs: {},
    createdAt,
    updatedAt: createdAt,
    variants: variants.map((v, i) => ({
      id: `v${i}-${counter}`,
      color: "Negro",
      ram: "8 GB",
      storage: "128 GB",
      stock: 1,
      ...v,
    })),
  }) as CatalogProduct;

const products = [
  make("Samsung", "S24", [{ priceCents: 250000, stock: 2 }]),
  make("Apple", "iPhone 13", [{ priceCents: 200000, salePriceCents: 180000 }]),
  make("Xiaomi", "Redmi 13", [{ priceCents: 80000, stock: 0 }]),
  make("Apple", "iPhone 15", [{ priceCents: 420000, storage: "256 GB" }]),
];

test("brand filter narrows the catalog", () => {
  expect(filterCatalog(products, { marca: "Apple" }).total).toBe(2);
  expect(filterCatalog(products, { marca: "Xiaomi" }).total).toBe(1);
  expect(filterCatalog(products, { marca: "Motorola" }).total).toBe(0);
});

test("text search matches brand and model", () => {
  expect(filterCatalog(products, { q: "iphone" }).total).toBe(2);
  expect(filterCatalog(products, { q: "s24" }).total).toBe(1);
  expect(filterCatalog(products, { q: "motorola" }).total).toBe(0);
});

test("storage and ram filters look inside the variants", () => {
  expect(filterCatalog(products, { almacenamiento: "256 GB" }).total).toBe(1);
  expect(filterCatalog(products, { almacenamiento: "64 GB" }).total).toBe(0);
  expect(filterCatalog(products, { ram: "8 GB" }).total).toBe(4);
});

test("price ranges use the visible price", () => {
  expect(filterCatalog(products, { precio: "hasta-1000" }).total).toBe(1);
  expect(filterCatalog(products, { precio: "1000-2000" }).total).toBe(1);
  expect(filterCatalog(products, { precio: "2000-3500" }).total).toBe(1);
  expect(filterCatalog(products, { precio: "desde-3500" }).total).toBe(1);
  expect(filterCatalog(products, { precio: "desconocido" }).total).toBe(4);
});

test("availability separates in stock from sold out", () => {
  expect(filterCatalog(products, { disponible: "1" }).total).toBe(3);
  expect(filterCatalog(products, { disponible: "agotado" }).total).toBe(1);
});

test("sorting by price uses the cheapest variant", () => {
  const asc = filterCatalog(products, { orden: "precio-asc" }).items.map(
    (p) => p.model,
  );
  expect(asc[0]).toBe("Redmi 13");
  expect(asc[3]).toBe("iPhone 15");
  const desc = filterCatalog(products, { orden: "precio-desc" }).items;
  expect(desc[0].model).toBe("iPhone 15");
  expect(cheapestPrice(products[1])).toBe(180000);
});

test("pagination slices twelve items per page and clamps the page", () => {
  const many = Array.from({ length: 14 }, (_, i) =>
    make("Samsung", `M${i}`, [{ priceCents: 100000 + i }]),
  );
  const first = filterCatalog(many, {});
  expect(first.items.length).toBe(12);
  expect(first.pages).toBe(2);
  const second = filterCatalog(many, { pagina: "2" });
  expect(second.items.length).toBe(2);
  expect(second.page).toBe(2);
  expect(filterCatalog(many, { pagina: "99" }).page).toBe(2);
  expect(filterCatalog(many, { pagina: "0" }).page).toBe(1);
  expect(filterCatalog(many, { pagina: "abc" }).page).toBe(1);
  expect(filterCatalog([], {}).pages).toBe(1);
});

test("links keep filters and drop the first page", () => {
  expect(catalogHref({ marca: "Apple" })).toBe("/celulares?marca=Apple");
  expect(catalogHref({ marca: "Apple", pagina: "3" }, 2)).toBe(
    "/celulares?marca=Apple&pagina=2",
  );
  expect(catalogHref({})).toBe("/celulares");
  expect(catalogHref({ pagina: "5" }, 1)).toBe("/celulares");
});

test("page window keeps first, last and neighbours", () => {
  expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(pageWindow(5, 20)).toEqual([1, 0, 4, 5, 6, 0, 20]);
  expect(pageWindow(1, 20)).toEqual([1, 2, 0, 20]);
  expect(pageWindow(20, 20)).toEqual([1, 0, 19, 20]);
});

test("storages sort by capacity, not alphabetically", () => {
  expect(sortStorages(["1 TB", "128 GB", "64 GB", "512 GB"])).toEqual([
    "64 GB",
    "128 GB",
    "512 GB",
    "1 TB",
  ]);
});

test("facets count every option before applying it", () => {
  const facets = catalogFacets(products, {});
  expect(facets.total).toBe(4);
  expect(facets.brands).toEqual({ Samsung: 1, Apple: 2, Xiaomi: 1 });
  expect(facets.available).toBe(3);
  expect(facets.soldOut).toBe(1);
  expect(facets.prices["hasta-1000"]).toBe(1);
  expect(facets.prices["desde-3500"]).toBe(1);
  expect(facets.storages["256 GB"]).toBe(1);
});

test("facets ignore their own dimension and respect the rest", () => {
  const facets = catalogFacets(products, { marca: "Apple" });
  expect(facets.total).toBe(2);
  // Brand counts keep every brand reachable: they show what switching would give.
  expect(facets.brands).toEqual({ Samsung: 1, Apple: 2, Xiaomi: 1 });
  expect(facets.storages["128 GB"]).toBe(1);
  expect(facets.rams["8 GB"]).toBe(2);
});

test("toggling a filter removes it and resets the page", () => {
  expect(toggleHref({}, "marca", "Apple")).toBe("/celulares?marca=Apple");
  expect(toggleHref({ marca: "Apple" }, "marca", "Apple")).toBe("/celulares");
  expect(toggleHref({ marca: "Apple", pagina: "3" }, "ram", "8 GB")).toBe(
    "/celulares?marca=Apple&ram=8+GB",
  );
});
