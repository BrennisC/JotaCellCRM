import { prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";
import {
  filterCatalog,
  sortStorages,
  type CatalogSearch,
} from "@/lib/catalog-filters";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";
import { CatalogPagination } from "@/components/catalog-pagination";
import { Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

const normalize = (raw: Record<string, string | string[] | undefined>) =>
  Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as CatalogSearch;

export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let products: Awaited<ReturnType<typeof catalog>> = [];
  let settings: { name: string; address: string; phone: string } | null = null;
  try {
    [products, settings] = await Promise.all([
      catalog(),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
  } catch {}
  const search = normalize(await searchParams);
  const { items, total, page, pages } = filterCatalog(products, search);
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const conditions = [...new Set(products.map((p) => p.condition))].sort();
  const rams = [
    ...new Set(products.flatMap((p) => p.variants.map((v) => v.ram))),
  ].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  const storages = sortStorages(
    products.flatMap((p) => p.variants.map((v) => v.storage)),
  );
  return (
    <>
      <StoreHeader name={settings?.name} />
      <main className="store-container listing-page">
        <div className="listing-heading">
          <span className="eyebrow">
            <span /> EXPLORA A TU RITMO
          </span>
          <h1>
            El celular <em>ideal existe.</em>
          </h1>
          <p>
            Filtra, compara y descubre todos los detalles de tu próximo equipo.
          </p>
        </div>
        <CatalogFilters
          search={search}
          brands={brands}
          conditions={conditions}
          rams={rams}
          storages={storages}
          total={total}
        >
          <div>
            {items.length ? (
              <div className="product-grid catalog-products">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">
                  <Smartphone size={29} />
                </div>
                <h3>No encontramos modelos con esos filtros.</h3>
                <p>
                  Prueba con otras opciones o limpia los filtros para ver todo.
                </p>
              </div>
            )}
            <CatalogPagination page={page} pages={pages} search={search} />
          </div>
        </CatalogFilters>
      </main>
      <StoreFooter
        name={settings?.name}
        address={settings?.address}
        phone={settings?.phone}
      />
    </>
  );
}
