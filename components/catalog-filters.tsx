"use client";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef, useTransition } from "react";
import {
  sortOptions,
  type CatalogFacets,
  type CatalogSearch,
} from "@/lib/catalog-filters";
import { CatalogChips } from "./catalog-chips";
import { CatalogActiveFilters } from "./catalog-active-filters";
import { CatalogAdvancedFilters } from "./catalog-advanced-filters";

export function CatalogFilters({
  search,
  brands,
  rams,
  storages,
  facets,
  total,
  children,
}: {
  search: CatalogSearch;
  brands: string[];
  rams: string[];
  storages: string[];
  facets: CatalogFacets;
  total: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const value = (key: string, fallback = "") => search[key] ?? fallback;

  const push = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() =>
      router.push(query ? `/celulares?${query}` : "/celulares"),
    );
  };

  const submit = (target: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [key, field] of new FormData(target))
      if (typeof field === "string" && field.trim()) params.set(key, field);
    push(params);
  };

  /** Removes only the text query, keeping the selected filters. */
  const clearSearch = () => {
    const params = new URLSearchParams();
    for (const [key, field] of new FormData(form.current!))
      if (key !== "q" && typeof field === "string" && field.trim())
        params.set(key, field);
    push(params);
  };

  return (
    <form
      ref={form}
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget);
      }}
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement)
          submit(event.currentTarget);
      }}
    >
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={19} aria-hidden="true" />
          <input
            key={`q-${value("q")}`}
            name="q"
            aria-label="Buscar celulares"
            placeholder="Busca por marca o modelo..."
            defaultValue={value("q")}
          />
          {value("q") && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={clearSearch}
            >
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="catalog-toolbar-meta">
          <span className="result-count" aria-live="polite">
            {pending
              ? "Buscando..."
              : `${total} ${total === 1 ? "modelo" : "modelos"}`}
          </span>
          <label className="catalog-sort">
            Ordenar
            <select
              key={`orden-${value("orden", "recientes")}`}
              name="orden"
              defaultValue={value("orden", "recientes")}
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <CatalogChips search={search} brands={brands} facets={facets} />
      <CatalogActiveFilters search={search} />
      <CatalogAdvancedFilters
        search={search}
        storages={storages}
        rams={rams}
        facets={facets}
      />
      {children}
    </form>
  );
}
