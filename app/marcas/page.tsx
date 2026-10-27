import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { BrandMark } from "@/components/brand-mark";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Marcas de celulares",
  description:
    "Explora las marcas disponibles en JOTACELL y entra directo al catálogo de cada fabricante.",
  alternates: { canonical: "/marcas" },
  openGraph: { url: "/marcas" },
};
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
          <span /> EXPLORA POR FABRICANTE
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
                <BrandMark brand={b.brand} />
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
