"use client";
import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Product } from "./types";
import { Actions, Field } from "./form-parts";
import { FirstVariantFields } from "./first-variant-fields";
import { specFields } from "@/lib/spec-fields";
import { conditions } from "@/lib/conditions";
import { fetchWithAuth } from "@/lib/client-auth";

export function ProductForm({
  product,
  onSubmit,
  onClose,
}: {
  product: Product | null;
  onSubmit: (body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
}) {
  const [images, setImages] = useState<string[]>(product?.images || []),
    [uploading, setUploading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [specs, setSpecs] = useState<Record<string, Record<string, string>>>(
      product?.specs || {},
    );
  const upload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files).slice(0, 8 - images.length)) {
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetchWithAuth("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setImages((items) => [...items, json.url]);
      } catch (e) {
        setError((e as Error).message);
        break;
      }
    }
    setUploading(false);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const values = Object.fromEntries(new FormData(e.currentTarget));
        const first = !product?.variants.length;
        try {
          await onSubmit({
            ...values,
            id: product?.id,
            featured: values.featured === "on",
            published: values.published === "on",
            images,
            specs,
            variant: first
              ? {
                  storage: values.storage,
                  color: values.color,
                  ram: values.ram,
                  price: values.price,
                  salePrice: values.salePrice,
                  stock: values.stock,
                }
              : undefined,
          });
          onClose();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="admin-form-grid">
        <Field label="Marca">
          <input
            name="brand"
            required
            defaultValue={product?.brand}
            placeholder="Ej. Samsung"
          />
        </Field>
        <Field label="Modelo">
          <input
            name="model"
            required
            defaultValue={product?.model}
            placeholder="Ej. Galaxy S25"
          />
        </Field>
        <Field label="Identificador URL">
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={product?.slug}
            placeholder="galaxy-s25"
          />
        </Field>
        <Field label="Garantía">
          <input
            name="warranty"
            defaultValue={product?.warranty || "12 meses"}
          />
        </Field>
        <Field label="Estado del equipo">
          <select name="condition" defaultValue={product?.condition || "Nuevo"}>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descripción">
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
            placeholder="Cuenta lo que hace especial a este equipo"
          />
        </Field>
      </div>
      <div className="admin-form-subheading">Fotografías del equipo</div>
      <p className="form-help">
        Sube imágenes JPG, PNG o WebP (máximo 4 MB). Orden sugerido: frontal,
        reverso, lateral, cámara y pantalla.
      </p>
      <div className="upload-list">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="upload-item">
            <Image
              src={url}
              alt={`Fotografía ${i + 1}`}
              width={80}
              height={70}
              unoptimized
            />
            <span>
              {["Frontal", "Reverso", "Lateral", "Cámara", "Pantalla"][i] ||
                `Vista ${i + 1}`}
            </span>
            <button
              type="button"
              aria-label="Quitar fotografía"
              onClick={() =>
                setImages((items) => items.filter((_, j) => j !== i))
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {images.length < 8 && (
          <label className="upload-control">
            <ImagePlus size={23} />
            <span>{uploading ? "Subiendo..." : "Subir foto"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              onChange={(e) => void upload(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <div className="admin-form-subheading">Especificaciones técnicas</div>
      <p className="form-help">
        Completa solo los campos que quieras mostrar en la ficha pública.
      </p>
      <div className="spec-edit-groups">
        {Object.entries(specFields).map(([group, fields]) => (
          <details
            key={group}
            className="spec-edit-group"
            open={!!product?.specs[group]}
          >
            <summary>{group}</summary>
            <div className="admin-form-grid">
              {fields
                .filter(
                  (f) =>
                    !(
                      group === "Memoria" &&
                      ["RAM", "Almacenamiento"].includes(f)
                    ),
                )
                .map((field) => (
                  <Field key={field} label={field}>
                    <input
                      value={specs[group]?.[field] || ""}
                      onChange={(e) =>
                        setSpecs((current) => ({
                          ...current,
                          [group]: {
                            ...current[group],
                            [field]: e.target.value,
                          },
                        }))
                      }
                      placeholder={field}
                    />
                  </Field>
                ))}
            </div>
          </details>
        ))}
      </div>
      {!product?.variants.length && <FirstVariantFields />}
      <div className="admin-switches">
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={product?.published || false}
          />{" "}
          Publicar en la tienda
        </label>
        <label>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured || false}
          />{" "}
          Destacar en inicio
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <Actions
        cancel={onClose}
        busy={busy || uploading}
        label={product ? "Actualizar celular" : "Crear celular"}
      />
    </form>
  );
}
