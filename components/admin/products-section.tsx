"use client";
import { useState } from "react";
import Image from "next/image";
import { Edit3, Plus, Search, Smartphone, Trash2 } from "lucide-react";
import { money } from "@/lib/format";
import type { AdminData, Product, Variant } from "./types";
import { Actions, Badge, Field, Modal, PageTitle } from "./form-parts";
import { ProductForm } from "./product-form";

type Submit = (
  path: string,
  body: Record<string, unknown>,
  method?: string,
) => Promise<unknown>;
export function ProductsSection({
  data,
  submit,
}: {
  data: AdminData;
  submit: Submit;
}) {
  const [editing, setEditing] = useState<Product | null>(null),
    [modal, setModal] = useState(false),
    [variantProduct, setVariantProduct] = useState<Product | null>(null),
    [variant, setVariant] = useState<Variant | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [search, setSearch] = useState("");
  const products = data.products.filter((p) =>
    `${p.brand} ${p.model} ${p.slug}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const remove = async (p: Product) => {
    if (
      !window.confirm(
        `¿Eliminar ${p.brand} ${p.model}? Si tiene ventas, se ocultará sin borrar su historial.`,
      )
    )
      return;
    try {
      await submit("products", { id: p.id }, "DELETE");
    } catch {}
  };
  return (
    <>
      <PageTitle
        tag="CATÁLOGO ADMINISTRATIVO"
        title="Celulares"
        description="Crea modelos, elige sus variantes y decidí qué mostrar en tu tienda."
        action={
          <button
            className="admin-primary"
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            <Plus size={18} /> Nuevo celular
          </button>
        }
      />
      <div className="admin-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca, modelo o identificador..."
        />
      </div>
      <div className="admin-panel table-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Todos los modelos</h2>
            <p>{products.length} registrados</p>
          </div>
        </div>
        {products.length ? (
          products.map((p) => (
            <div className="admin-product-group" key={p.id}>
              <div className="admin-product-row">
                <div className="admin-product-thumb">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt=""
                      width={52}
                      height={52}
                      unoptimized
                    />
                  ) : (
                    <Smartphone size={28} />
                  )}
                </div>
                <div className="admin-row-main">
                  <strong>
                    {p.brand} {p.model}
                  </strong>
                  <small>
                    {p.variants.length} variantes ·{" "}
                    {p.variants.reduce((sum, v) => sum + v.stock, 0)} unidades
                  </small>
                </div>
                <div className="admin-row-price">
                  {p.variants[0]
                    ? money(
                        p.variants[0].salePriceCents ??
                          p.variants[0].priceCents,
                      )
                    : "Sin precio"}
                </div>
                <Badge tone={p.published ? "green" : "neutral"}>
                  {p.published ? "Publicado" : "Oculto"}
                </Badge>
                <div className="admin-row-actions">
                  <button
                    title="Agregar variante"
                    onClick={() => {
                      setVariantProduct(p);
                      setVariant(null);
                      setError("");
                    }}
                  >
                    <Plus size={17} />
                  </button>
                  <button
                    title="Editar celular"
                    onClick={() => {
                      setEditing(p);
                      setModal(true);
                    }}
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    title="Eliminar celular"
                    onClick={() => void remove(p)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              {p.variants.length > 0 && (
                <div className="admin-variant-chips">
                  {p.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setVariantProduct(p);
                        setVariant(v);
                        setError("");
                      }}
                      title={`Editar ${v.color} ${v.storage}`}
                    >
                      <Edit3 size={12} />
                      {v.color} · {v.ram} · {v.storage} · {v.stock} uds.
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="admin-empty">
            <Smartphone size={29} />
            <h3>Tu catálogo comienza aquí</h3>
            <p>
              Agrega tu primer modelo y luego configurá sus variantes y stock.
            </p>
          </div>
        )}
      </div>
      {modal && (
        <Modal
          title={editing ? "Editar celular" : "Nuevo celular"}
          onClose={() => setModal(false)}
        >
          <ProductForm
            product={editing}
            onSubmit={(body) => submit("products", body)}
            onClose={() => setModal(false)}
          />
        </Modal>
      )}
      {variantProduct && (
        <Modal
          title={variant ? "Editar variante" : "Nueva variante"}
          onClose={() => setVariantProduct(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await submit(
                  "products",
                  {
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                    productId: variantProduct.id,
                    id: variant?.id,
                  },
                  "PATCH",
                );
                setVariantProduct(null);
              } catch (ex) {
                setError((ex as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="form-help">
              {variantProduct.brand} {variantProduct.model}
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
                    variant?.salePriceCents
                      ? variant.salePriceCents / 100
                      : undefined
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
            <Actions busy={busy} cancel={() => setVariantProduct(null)} />
          </form>
        </Modal>
      )}
    </>
  );
}
