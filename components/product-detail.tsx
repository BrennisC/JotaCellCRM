"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import type { Product, Variant } from "@prisma/client";
import { money } from "@/lib/format";
import { inquiryFrom } from "@/lib/inquiry";
import { PhoneArtwork } from "./store-shell";
import { SpecPanel } from "./spec-panel";
import { InquiryAction } from "./inquiry-action";

const labels = ["Frontal", "Reverso", "Lateral", "Cámara", "Pantalla"];
type DetailProduct = Omit<Product, "createdAt" | "updatedAt"> & {
  variants: Variant[];
};
export function ProductDetail({
  product,
  storeName,
  phone,
}: {
  product: DetailProduct;
  storeName: string;
  phone?: string;
}) {
  const variants = product.variants;
  const [selected, setSelected] = useState(variants[0]?.id || ""),
    [imageIndex, setImageIndex] = useState(0),
    [zoom, setZoom] = useState(false);
  const variant = variants.find((v) => v.id === selected) || variants[0];
  const colors = [
    ...new Map(variants.map((v) => [v.color, v.colorHex])).entries(),
  ];
  const ram = [
    ...new Set(
      variants.filter((v) => v.color === variant?.color).map((v) => v.ram),
    ),
  ];
  const storage = [
    ...new Set(
      variants
        .filter((v) => v.color === variant?.color && v.ram === variant?.ram)
        .map((v) => v.storage),
    ),
  ];
  const images = Array.isArray(product.images)
    ? product.images.filter((v): v is string => typeof v === "string")
    : [];
  const specs =
    product.specs &&
    typeof product.specs === "object" &&
    !Array.isArray(product.specs)
      ? (product.specs as Record<string, Record<string, string>>)
      : {};
  const setOption = (type: "color" | "ram" | "storage", value: string) => {
    const matches = variants.filter((v) => v[type] === value);
    const match =
      matches.find(
        (v) =>
          (type === "color" &&
            v.ram === variant?.ram &&
            v.storage === variant?.storage) ||
          (type === "ram" &&
            v.color === variant?.color &&
            v.storage === variant?.storage) ||
          (type === "storage" &&
            v.color === variant?.color &&
            v.ram === variant?.ram),
      ) ||
      matches.find((v) => v.color === variant?.color) ||
      matches[0];
    if (match) setSelected(match.id);
  };
  const move = (step: number) =>
    setImageIndex((i) => (i + step + images.length) % images.length);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <main className="detail-page store-container">
      <div className="detail-breadcrumb">
        <Link href="/celulares">Celulares</Link>
        <ChevronRight size={15} />
        <span>{product.brand}</span>
        <ChevronRight size={15} />
        <strong>{product.model}</strong>
      </div>
      <div className="detail-layout">
        <section className="detail-commercial">
          <Link href="/celulares" className="back-link">
            <ArrowLeft size={17} /> Volver al catálogo
          </Link>
          <div className="detail-brand">
            <span>{product.brand.slice(0, 2).toUpperCase()}</span>
            {product.brand}
          </div>
          <h1>{product.model}</h1>
          <p className="model-line">
            {product.brand} · {product.model} <span>por {storeName}</span>
          </p>
          <p className="detail-description">
            {product.description ||
              "Diseñado para acompañarte en cada momento. Descubre todos los detalles de este equipo."}
          </p>
          <div className="variant-field">
            <strong>
              COLOR <span>— {variant?.color || "Sin variantes"}</span>
            </strong>
            <div className="color-options">
              {colors.map(([color, hex]) => (
                <button
                  key={color}
                  className={`color-option ${variant?.color === color ? "chosen" : ""}`}
                  style={{ "--swatch": hex } as React.CSSProperties}
                  onClick={() => setOption("color", color)}
                  title={color}
                  aria-label={`Color ${color}`}
                >
                  <i />
                </button>
              ))}
            </div>
          </div>
          <div className="variant-field">
            <strong>MEMORIA RAM</strong>
            <div className="choice-options">
              {ram.map((r) => (
                <button
                  className={variant?.ram === r ? "chosen" : ""}
                  onClick={() => setOption("ram", r)}
                  key={r}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="variant-field">
            <strong>ALMACENAMIENTO</strong>
            <div className="choice-options">
              {storage.map((s) => (
                <button
                  className={variant?.storage === s ? "chosen" : ""}
                  onClick={() => setOption("storage", s)}
                  key={s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="detail-price">
            <span>PRECIO ACTUAL</span>
            <div>
              <strong>
                {variant
                  ? money(variant.salePriceCents ?? variant.priceCents)
                  : "Consultar"}
              </strong>
              {variant?.salePriceCents && (
                <del>{money(variant.priceCents)}</del>
              )}
            </div>
            <span
              className={
                variant?.stock ? "available-chip" : "available-chip out"
              }
            >
              <i />
              {variant?.stock ? "Disponible" : "Agotado"}
            </span>
          </div>
          <div className="warranty-note">
            <ShieldCheck size={19} />
            <span>
              Estado: <strong>{product.condition || "Nuevo"}</strong> ·
              Garantía: <strong>{product.warranty}</strong>
            </span>
          </div>
          <InquiryAction
            phone={phone}
            details={inquiryFrom(product, variant, storeName)}
          />
        </section>
        <section className="detail-gallery">
          <div className="gallery-stage">
            {images[imageIndex] ? (
              <Image
                src={images[imageIndex]}
                alt={`${product.brand} ${product.model}, vista ${labels[imageIndex] || imageIndex + 1}`}
                className="gallery-main-image"
                width={900}
                height={900}
                unoptimized
              />
            ) : (
              <PhoneArtwork color="blue" />
            )}
            <button
              className="expand-btn"
              onClick={() => setZoom(true)}
              aria-label="Ampliar imagen"
            >
              <Expand size={19} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="gallery-arrow left"
                  onClick={() => move(-1)}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={21} />
                </button>
                <button
                  className="gallery-arrow right"
                  onClick={() => move(1)}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={21} />
                </button>
              </>
            )}
            <span className="gallery-count">
              {String(imageIndex + 1).padStart(2, "0")} /{" "}
              {String(Math.max(images.length, 1)).padStart(2, "0")}
            </span>
          </div>
          <div className="gallery-thumbs">
            {images.length ? (
              images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  className={i === imageIndex ? "active" : ""}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Ver ${labels[i] || `imagen ${i + 1}`}`}
                >
                  <Image src={img} alt="" width={60} height={60} unoptimized />
                  <span>{labels[i] || `Vista ${i + 1}`}</span>
                </button>
              ))
            ) : (
              <div className="gallery-no-images">
                <Smartphone size={18} /> Las fotografías de este modelo estarán
                disponibles pronto.
              </div>
            )}
          </div>
        </section>
        <SpecPanel specs={specs} variant={variant} />
      </div>
      <div className="detail-bottom-note">
        <Check size={17} /> Información y disponibilidad actualizadas desde
        nuestro catálogo.
      </div>
      {zoom && (
        <div
          className="zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setZoom(false)}
        >
          <button aria-label="Cerrar imagen" onClick={() => setZoom(false)}>
            <X size={24} />
          </button>
          {images[imageIndex] ? (
            <Image
              src={images[imageIndex]}
              alt={`${product.brand} ${product.model} ampliado`}
              width={1200}
              height={1200}
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <PhoneArtwork />
          )}
        </div>
      )}
    </main>
  );
}
