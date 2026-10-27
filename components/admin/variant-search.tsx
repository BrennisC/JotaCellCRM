"use client";
import { useMemo } from "react";
import type { Product, Variant } from "./types";
import { SearchSelect } from "./search-select";

export type VariantOption = Variant & { product: Product };

const variantLabel = (option: VariantOption) =>
  `${option.product.brand} ${option.product.model} · ${option.color} · ${option.storage}`;

const variantKeywords = (option: VariantOption) =>
  [
    option.product.brand,
    option.product.model,
    option.color,
    option.storage,
    option.ram,
    ...option.serials.filter((serial) => !serial.sold).map((s) => s.imei),
  ].join(" ");

export function VariantSearch({
  options,
  value,
  onChange,
}: {
  options: VariantOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const items = useMemo(
    () =>
      options.map((option) => ({
        id: option.id,
        label: variantLabel(option),
        meta: option.stock > 0 ? `${option.stock} disponibles` : "Sin stock",
        keywords: variantKeywords(option),
        disabled: option.stock <= 0,
      })),
    [options],
  );

  return (
    <SearchSelect
      options={items}
      value={value}
      onChange={onChange}
      placeholder="Buscar marca, modelo, color o IMEI..."
      empty="No hay variantes con stock disponible."
    />
  );
}
