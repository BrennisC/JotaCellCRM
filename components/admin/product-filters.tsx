"use client";
import { Search, X } from "lucide-react";

export function ProductFilters({
  search,
  brand,
  visibility,
  brands,
  onSearch,
  onBrand,
  onVisibility,
  onClear,
}: {
  search: string;
  brand: string;
  visibility: string;
  brands: string[];
  onSearch: (value: string) => void;
  onBrand: (value: string) => void;
  onVisibility: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="admin-filters">
      <div className="admin-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar marca, modelo o identificador..."
        />
        {search && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => onSearch("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <label>
        Marca
        <select value={brand} onChange={(event) => onBrand(event.target.value)}>
          <option value="">Todas</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        Visibilidad
        <select
          value={visibility}
          onChange={(event) => onVisibility(event.target.value)}
        >
          <option value="">Todas</option>
          <option value="published">Publicados</option>
          <option value="hidden">Ocultos</option>
        </select>
      </label>
      <button type="button" className="admin-secondary small" onClick={onClear}>
        Limpiar
      </button>
    </div>
  );
}
