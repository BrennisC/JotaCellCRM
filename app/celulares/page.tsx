import { prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { CatalogGrid } from "@/components/catalog-grid";

export const dynamic = "force-dynamic";
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string }>;
}) {
  let products: Awaited<ReturnType<typeof catalog>> = [];
  let settings: { name: string; address: string; phone: string } | null = null;
  try {
    [products, settings] = await Promise.all([
      catalog(),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
  } catch {}
  const { marca } = await searchParams;
  return (
    <>
      <StoreHeader name={settings?.name} />
      <main className="store-container listing-page">
        <div className="listing-heading">
          <span className="eyebrow">
            <span /> EXPLORÁ A TU RITMO
          </span>
          <h1>
            El celular <em>ideal existe.</em>
          </h1>
          <p>
            Filtra, compara y descubre todos los detalles de tu próximo equipo.
          </p>
        </div>
        <CatalogGrid products={products} initialBrand={marca} />
      </main>
      <StoreFooter
        name={settings?.name}
        address={settings?.address}
        phone={settings?.phone}
      />
    </>
  );
}
