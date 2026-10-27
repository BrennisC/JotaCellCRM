"use client";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRef, useTransition } from "react";
import {
  priceRanges,
  sortOptions,
  type CatalogSearch,
} from "@/lib/catalog-filters";

export function CatalogFilters({
  search,
  brands,
  rams,
  storages,
  conditions,
  total,
  children,
}: {
  search: CatalogSearch;
  brands: string[];
  rams: string[];
  storages: string[];
  conditions: string[];
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

  const clear = () => {
    const alreadyClean = Object.entries(search).every(
      ([key, field]) => key === "pagina" || !field,
    );
    if (alreadyClean) startTransition(() => router.refresh());
    else push(new URLSearchParams());
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
          <Search size={19} />
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
              <X size={17} />
            </button>
          )}
        </div>
        <span className="result-count" aria-live="polite">
          {pending
            ? "Buscando..."
            : `${total} ${total === 1 ? "modelo" : "modelos"}`}
        </span>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-filters">
          <h2>
            <SlidersHorizontal size={18} /> Filtros
          </h2>
          <label>
            Marca
            <select
              key={`marca-${value("marca")}`}
              name="marca"
              defaultValue={value("marca")}
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado del equipo
            <select
              key={`condicion-${value("condicion")}`}
              name="condicion"
              defaultValue={value("condicion")}
            >
              <option value="">Todos</option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </label>
          <label>
            Almacenamiento
            <select
              key={`almacenamiento-${value("almacenamiento")}`}
              name="almacenamiento"
              defaultValue={value("almacenamiento")}
            >
              <option value="">Todos</option>
              {storages.map((storage) => (
                <option key={storage} value={storage}>
                  {storage}
                </option>
              ))}
            </select>
          </label>
          <label>
            Memoria RAM
            <select
              key={`ram-${value("ram")}`}
              name="ram"
              defaultValue={value("ram")}
            >
              <option value="">Todas</option>
              {rams.map((ram) => (
                <option key={ram} value={ram}>
                  {ram}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio
            <select
              key={`precio-${value("precio")}`}
              name="precio"
              defaultValue={value("precio")}
            >
              <option value="">Cualquier precio</option>
              {priceRanges.map((range) => (
                <option key={range.key} value={range.key}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Disponibilidad
            <select
              key={`disponible-${value("disponible")}`}
              name="disponible"
              defaultValue={value("disponible")}
            >
              <option value="">Todos</option>
              <option value="1">Disponibles</option>
              <option value="agotado">Agotados</option>
            </select>
          </label>
          <label>
            Ordenar por
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
          <button type="button" className="clear-filters" onClick={clear}>
            Limpiar filtros
          </button>
        </aside>
        {children}
      </div>
    </form>
  );
}
