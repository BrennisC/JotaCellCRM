"use client";
import { useState } from "react";
import Image from "next/image";
import { Edit3, Plus, Smartphone, Trash2 } from "lucide-react";
import { money } from "@/lib/format";
import type { AdminData, Product, Variant } from "./types";
import { Badge, Modal, PageTitle } from "./form-parts";
import { ProductForm } from "./product-form";
import { VariantForm } from "./variant-form";
import { ProductFilters } from "./product-filters";
import { AdminPager } from "./admin-pager";
import { paginate } from "@/lib/pagination";

const PAGE_SIZE = 8;

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
    [search, setSearch] = useState(""),
    [brand, setBrand] = useState(""),
    [visibility, setVisibility] = useState(""),
    [page, setPage] = useState(1);
  const filtered = data.products.filter((p) => {
    if (
      !`${p.brand} ${p.model} ${p.slug}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
      return false;
    if (brand && p.brand !== brand) return false;
    if (visibility === "published" && !p.published) return false;
    if (visibility === "hidden" && p.published) return false;
    return true;
  });
  const products = paginate(filtered, page, PAGE_SIZE);
  const brands = [...new Set(data.products.map((p) => p.brand))].sort();
  const update = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };
  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setVisibility("");
    setPage(1);
  };
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
      <ProductFilters
        search={search}
        brand={brand}
        visibility={visibility}
        brands={brands}
        onSearch={update(setSearch)}
        onBrand={update(setBrand)}
        onVisibility={update(setVisibility)}
        onClear={clearFilters}
      />
      <div className="admin-panel table-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Todos los modelos</h2>
            <p>{products.total} registrados</p>
          </div>
        </div>
        {products.items.length ? (
          products.items.map((p) => (
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
        <AdminPager
          page={products.page}
          pages={products.pages}
          onChange={setPage}
          label="Páginas de celulares"
        />
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
          <VariantForm
            product={variantProduct}
            variant={variant}
            submit={submit}
            onClose={() => setVariantProduct(null)}
          />
        </Modal>
      )}{" "}
    </>
  );
}
