import { prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";
export default async function Offers() {
  let products: Awaited<ReturnType<typeof catalog>> = [];
  let settings: { name: string; address: string; phone: string } | null = null;
  try {
    [products, settings] = await Promise.all([
      catalog(),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
  } catch {}
  const offers = products.filter((p) =>
    p.variants.some((v) => v.salePriceCents !== null),
  );
  return (
    <>
      <StoreHeader name={settings?.name} />
      <main className="store-container simple-page">
        <span className="eyebrow">
          <span /> OPORTUNIDADES ESPECIALES
        </span>
        <h1>
          Buenas ideas,
          <br />
          <em>mejores precios.</em>
        </h1>
        <p>
          Descubre los modelos con precios especiales disponibles en nuestra
          tienda.
        </p>
        {offers.length ? (
          <div className="product-grid offers-grid">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <h3>Nuevas ofertas próximamente.</h3>
            <p>Vuelve pronto para descubrir oportunidades especiales.</p>
          </div>
        )}
      </main>
      <StoreFooter
        name={settings?.name}
        address={settings?.address}
        phone={settings?.phone}
      />
    </>
  );
}
