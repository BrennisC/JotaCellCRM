import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, HardDrive, Palette } from "lucide-react";
import type { Product, Variant } from "@prisma/client";
import { money } from "@/lib/format";
import { productImage } from "@/lib/catalog";
import { PhoneArtwork } from "./store-shell";

export function ProductCard({
  product,
}: {
  product: Product & { variants: Variant[] };
}) {
  const cheapest = [...product.variants].sort(
    (a, b) =>
      (a.salePriceCents ?? a.priceCents) - (b.salePriceCents ?? b.priceCents),
  )[0];
  const image = productImage(product.images);
  const inStock = product.variants.some((v) => v.stock > 0);
  return (
    <Link className="product-card" href={`/celulares/${product.slug}`}>
      <div className="product-visual">
        {image ? (
          <Image
            src={image}
            alt={`${product.brand} ${product.model}`}
            className="product-photo"
            width={300}
            height={300}
            unoptimized
          />
        ) : (
          <PhoneArtwork color="blue" />
        )}
        {cheapest?.salePriceCents && <span className="sale-tag">Oferta</span>}
        <span className="card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="product-content">
        <span className="product-brand">{product.brand}</span>
        <h3>{product.model}</h3>
        <div className="product-meta">
          <span>
            <HardDrive size={14} />
            {[...new Set(product.variants.map((v) => v.storage))].join(" / ") ||
              "—"}
          </span>
          <span>
            <Palette size={14} />
            {[...new Set(product.variants.map((v) => v.color))].length} colores
          </span>
        </div>
        <div className="product-bottom">
          <div>
            <small>DESDE</small>
            <strong>
              {cheapest
                ? money(cheapest.salePriceCents ?? cheapest.priceCents)
                : "Consultar"}
            </strong>
            {cheapest?.salePriceCents && (
              <del>{money(cheapest.priceCents)}</del>
            )}
          </div>
          <span className={inStock ? "stock-label" : "stock-label sold-out"}>
            <span />
            {inStock ? "Disponible" : "Agotado"}
          </span>
        </div>
      </div>
    </Link>
  );
}
