import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreHeader, StoreFooter } from "@/components/store-shell";

export const dynamic = "force-dynamic";
export default async function Brands() {
  let brands: { brand: string; _count: { _all: number } }[] = [];
  let settings: { name: string; address: string; phone: string } | null = null;
  try {
    [brands, settings] = await Promise.all([
      prisma.product.groupBy({
        by: ["brand"],
        where: { published: true },
        _count: { _all: true },
      }),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
  } catch {}
  return (
    <>
      <StoreHeader name={settings?.name} />
      <main className="store-container simple-page">
        <span className="eyebrow">
          <span /> EXPLORÁ POR FABRICANTE
        </span>
        <h1>
          Grandes marcas,
          <br />
          <em>nuevas posibilidades.</em>
        </h1>
        <p>Encuentra tus marcas favoritas y descubre todos sus modelos.</p>
        {brands.length ? (
          <div className="brands-list">
            {brands.map((b) => (
              <Link
                href={`/celulares?marca=${encodeURIComponent(b.brand)}`}
                key={b.brand}
              >
                <span className="brand-monogram">
                  {b.brand.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>{b.brand}</strong>
                  <small>
                    {b._count._all} {b._count._all === 1 ? "modelo" : "modelos"}
                  </small>
                </div>
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            Muy pronto podrás explorar las marcas de nuestro catálogo.
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
