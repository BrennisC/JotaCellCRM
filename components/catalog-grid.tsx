"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, Smartphone, X } from "lucide-react";
import type { Product, Variant } from "@prisma/client";
import { ProductCard } from "./product-card";

export function CatalogGrid({
  products,
  initialBrand,
}: {
  products: (Product & { variants: Variant[] })[];
  initialBrand?: string;
}) {
  const [query, setQuery] = useState(""),
    [brand, setBrand] = useState(initialBrand || ""),
    [ram, setRam] = useState(""),
    [storage, setStorage] = useState(""),
    [availability, setAvailability] = useState(""),
    [maxPrice, setMaxPrice] = useState("");
  const brands = [...new Set(products.map((p) => p.brand))].sort(),
    rams = [
      ...new Set(products.flatMap((p) => p.variants.map((v) => v.ram))),
    ].sort(),
    storages = [
      ...new Set(products.flatMap((p) => p.variants.map((v) => v.storage))),
    ].sort();
  const filtered = products.filter((p) => {
    const variants = p.variants.filter(
      (v) =>
        (!ram || v.ram === ram) &&
        (!storage || v.storage === storage) &&
        (!maxPrice ||
          (v.salePriceCents ?? v.priceCents) <= Number(maxPrice) * 100),
    );
    return (
      p.brand.toLowerCase().includes(brand.toLowerCase()) &&
      `${p.brand} ${p.model}`.toLowerCase().includes(query.toLowerCase()) &&
      variants.length > 0 &&
      (!availability ||
        (availability === "available" && variants.some((v) => v.stock > 0)) ||
        (availability === "sold" && variants.every((v) => v.stock === 0)))
    );
  });
  return (
    <>
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={19} />
          <input
            aria-label="Buscar celulares"
            placeholder="Busca por marca o modelo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="Borrar búsqueda" onClick={() => setQuery("")}>
              <X size={17} />
            </button>
          )}
        </div>
        <span className="result-count">
          {filtered.length} {filtered.length === 1 ? "modelo" : "modelos"}
        </span>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-filters">
          <h2>
            <SlidersHorizontal size={18} /> Filtros
          </h2>
          <label>
            Marca
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            Memoria RAM
            <select value={ram} onChange={(e) => setRam(e.target.value)}>
              <option value="">Todas</option>
              {rams.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Almacenamiento
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
            >
              <option value="">Todos</option>
              {storages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Precio máximo (S/)
            <input
              type="number"
              min="0"
              placeholder="Sin límite"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>
          <label>
            Disponibilidad
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="available">Disponibles</option>
              <option value="sold">Agotados</option>
            </select>
          </label>
          <button
            className="clear-filters"
            onClick={() => {
              setBrand("");
              setRam("");
              setStorage("");
              setAvailability("");
              setMaxPrice("");
              setQuery("");
            }}
          >
            Limpiar filtros
          </button>
        </aside>
        <div>
          {filtered.length ? (
            <div className="product-grid catalog-products">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">
                <Smartphone size={29} />
              </div>
              <h3>No encontramos modelos por ahora.</h3>
              <p>
                Prueba con otros filtros o vuelve pronto para ver las novedades.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
