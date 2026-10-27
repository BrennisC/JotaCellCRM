"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
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
  const [term, setTerm] = useState(search.q || "");
  const [pending, startTransition] = useTransition();

  const apply = () => {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form.current!))
      if (typeof value === "string" && value.trim()) params.set(key, value);
    const query = params.toString();
    startTransition(() =>
      router.push(query ? `/celulares?${query}` : "/celulares"),
    );
  };

  return (
    <form
      ref={form}
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) apply();
      }}
    >
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={19} />
          <input
            name="q"
            aria-label="Buscar celulares"
            placeholder="Busca por marca o modelo..."
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          {term && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setTerm("");
                apply();
              }}
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
            <select name="marca" defaultValue={search.marca || ""}>
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
            <select name="condicion" defaultValue={search.condicion || ""}>
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
              name="almacenamiento"
              defaultValue={search.almacenamiento || ""}
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
            <select name="ram" defaultValue={search.ram || ""}>
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
            <select name="precio" defaultValue={search.precio || ""}>
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
            <select name="disponible" defaultValue={search.disponible || ""}>
              <option value="">Todos</option>
              <option value="1">Disponibles</option>
              <option value="agotado">Agotados</option>
            </select>
          </label>
          <label>
            Ordenar por
            <select name="orden" defaultValue={search.orden || "recientes"}>
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Link className="clear-filters" href="/celulares">
            Limpiar filtros
          </Link>
        </aside>
        {children}
      </div>
    </form>
  );
}
