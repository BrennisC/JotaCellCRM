import { ChevronDown } from "lucide-react";
import type { CatalogFacets, CatalogSearch } from "@/lib/catalog-filters";

const options = (
  values: string[],
  counts: Record<string, number>,
  current: string,
) => values.filter((value) => counts[value] > 0 || value === current);

export function CatalogAdvancedFilters({
  search,
  storages,
  rams,
  facets,
}: {
  search: CatalogSearch;
  storages: string[];
  rams: string[];
  facets: CatalogFacets;
}) {
  const active =
    Number(Boolean(search.almacenamiento)) + Number(Boolean(search.ram));
  return (
    <details className="catalog-more">
      <summary>
        <span>Más filtros</span>
        {active > 0 && <span className="more-count">{active}</span>}
        <ChevronDown size={17} className="more-chevron" aria-hidden="true" />
      </summary>
      <div className="catalog-more-grid">
        <label>
          Almacenamiento
          <select
            key={`almacenamiento-${search.almacenamiento ?? ""}`}
            name="almacenamiento"
            defaultValue={search.almacenamiento ?? ""}
          >
            <option value="">Todos</option>
            {options(
              storages,
              facets.storages,
              search.almacenamiento ?? "",
            ).map((storage) => (
              <option key={storage} value={storage}>
                {storage} ({facets.storages[storage] ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label>
          Memoria RAM
          <select
            key={`ram-${search.ram ?? ""}`}
            name="ram"
            defaultValue={search.ram ?? ""}
          >
            <option value="">Todas</option>
            {options(rams, facets.rams, search.ram ?? "").map((ram) => (
              <option key={ram} value={ram}>
                {ram} ({facets.rams[ram] ?? 0})
              </option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
}
