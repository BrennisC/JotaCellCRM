"use client";
import { useState } from "react";
import type { Product, Variant } from "./types";
import { Actions, Field } from "./form-parts";

type Submit = (
  path: string,
  body: Record<string, unknown>,
  method?: string,
) => Promise<unknown>;

export function VariantForm({
  product,
  variant,
  submit,
  onClose,
}: {
  product: Product;
  variant: Variant | null;
  submit: Submit;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          await submit(
            "products",
            {
              ...Object.fromEntries(new FormData(event.currentTarget)),
              productId: product.id,
              id: variant?.id,
            },
            "PATCH",
          );
          onClose();
        } catch (exception) {
          setError((exception as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="form-help">
        {product.brand} {product.model}
      </p>
      <div className="admin-form-grid">
        <Field label="Color">
          <input
            name="color"
            defaultValue={variant?.color}
            placeholder="Azul niebla"
            required
          />
        </Field>
        <Field label="Color hexadecimal">
          <input
            name="colorHex"
            type="color"
            defaultValue={variant?.colorHex || "#dceaf4"}
          />
        </Field>
        <Field label="RAM">
          <input
            name="ram"
            defaultValue={variant?.ram}
            placeholder="8 GB"
            required
          />
        </Field>
        <Field label="Almacenamiento">
          <input
            name="storage"
            defaultValue={variant?.storage}
            placeholder="256 GB"
            required
          />
        </Field>
        <Field label="Precio regular (S/)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={
              variant?.priceCents ? variant.priceCents / 100 : undefined
            }
            required
          />
        </Field>
        <Field label="Precio oferta (opcional)">
          <input
            name="salePrice"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={
              variant?.salePriceCents ? variant.salePriceCents / 100 : undefined
            }
          />
        </Field>
        <Field label="Stock disponible">
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={variant?.stock ?? 0}
          />
        </Field>
      </div>
      {error && <p className="form-error">{error}</p>}
      <Actions busy={busy} cancel={onClose} />
    </form>
  );
}
