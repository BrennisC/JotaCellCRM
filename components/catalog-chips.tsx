import Link from "next/link";
import { Check } from "lucide-react";
import {
  priceRanges,
  toggleHref,
  type CatalogFacets,
  type CatalogSearch,
} from "@/lib/catalog-filters";

const chipClass = (active: boolean) => `filter-chip${active ? " active" : ""}`;

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="chip-row">
      <span className="chip-row-label">{label}</span>
      <div className="chip-track" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

/**
 * One-tap filters. Brands and prices are links, so the whole row works
 * without JavaScript and reflects the current url. Rows with no reachable
 * option are hidden instead of showing a dead end.
 */
export function CatalogChips({
  search,
  brands,
  facets,
}: {
  search: CatalogSearch;
  brands: string[];
  facets: CatalogFacets;
}) {
  const available = search.disponible === "1";
  const prices = priceRanges.filter(
    (range) =>
      (facets.prices[range.key] ?? 0) > 0 || search.precio === range.key,
  );
  const reachableBrands = brands.filter(
    (brand) => (facets.brands[brand] ?? 0) > 0 || search.marca === brand,
  );

  return (
    <div className="catalog-chips">
      {facets.soldOut > 0 && (
        <ChipRow label="Disponibilidad">
          <Link
            href={toggleHref(search, "disponible", "1")}
            className={chipClass(available)}
            aria-current={available ? "true" : undefined}
          >
            <Check size={15} aria-hidden="true" />
            Disponibles
          </Link>
        </ChipRow>
      )}
      {prices.length > 0 && (
        <ChipRow label="Precio">
          {prices.map((range) => {
            const active = search.precio === range.key;
            return (
              <Link
                key={range.key}
                href={toggleHref(search, "precio", range.key)}
                className={chipClass(active)}
                aria-current={active ? "true" : undefined}
              >
                {range.short}
                <span className="chip-count">
                  {facets.prices[range.key] ?? 0}
                </span>
              </Link>
            );
          })}
        </ChipRow>
      )}
      {reachableBrands.length > 0 && (
        <ChipRow label="Marca">
          {reachableBrands.map((brand) => {
            const active = search.marca === brand;
            return (
              <Link
                key={brand}
                href={toggleHref(search, "marca", brand)}
                className={chipClass(active)}
                aria-current={active ? "true" : undefined}
              >
                {brand}
                <span className="chip-count">{facets.brands[brand] ?? 0}</span>
              </Link>
            );
          })}
        </ChipRow>
      )}
    </div>
  );
}
