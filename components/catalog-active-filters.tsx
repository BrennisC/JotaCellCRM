import Link from "next/link";
import { X } from "lucide-react";
import {
  catalogHref,
  priceRanges,
  type CatalogSearch,
} from "@/lib/catalog-filters";

/** Human label for each removable filter; `orden` is a view preference, not a filter. */
const labels: Record<string, (value: string) => string> = {
  q: (value) => `"${value}"`,
  marca: (value) => value,
  almacenamiento: (value) => value,
  ram: (value) => `RAM ${value}`,
  precio: (value) =>
    priceRanges.find((range) => range.key === value)?.short ?? value,
  disponible: (value) => (value === "1" ? "Disponibles" : "Agotados"),
};

export function CatalogActiveFilters({ search }: { search: CatalogSearch }) {
  const entries = Object.entries(search).flatMap(([key, value]) =>
    value && labels[key] ? [[key, value] as const] : [],
  );
  if (!entries.length) return null;
  return (
    <div className="catalog-active">
      <span className="catalog-active-label">Filtros activos</span>
      {entries.map(([key, value]) => {
        const next = { ...search };
        delete next[key];
        return (
          <Link
            key={key}
            href={catalogHref(next)}
            className="filter-chip active"
            aria-label={`Quitar filtro ${labels[key](value)}`}
          >
            {labels[key](value)}
            <X size={13} aria-hidden="true" />
          </Link>
        );
      })}
      <Link href="/celulares" className="catalog-active-clear">
        Limpiar todo
      </Link>
    </div>
  );
}
