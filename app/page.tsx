import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Headphones,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";
import {
  StoreHeader,
  StoreFooter,
  PhoneArtwork,
} from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { BrandMark } from "@/components/brand-mark";
import { StoreJsonLd } from "@/components/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
export default async function Home() {
  let products: Awaited<ReturnType<typeof catalog>> = [],
    settings: { name: string; address: string; phone: string } | null = null;
  try {
    [products, settings] = await Promise.all([
      catalog(),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
  } catch {
    /* The storefront stays available while the database is being set up. */
  }
  const name = settings?.name || "JOTACELL";
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length ? featured : products.slice(0, 4);
  const brands = [...new Set(products.map((p) => p.brand))].slice(0, 8);
  const offers = products
    .filter((p) => p.variants.some((v) => v.salePriceCents !== null))
    .slice(0, 4);
  return (
    <>
      <StoreHeader name={name} />
      <main>
        <section className="hero">
          <div className="store-container hero-inner">
            <div className="hero-text">
              <span className="eyebrow">
                <span /> TU PRÓXIMO EQUIPO ESTÁ AQUÍ
              </span>
              <h1>
                Tecnología que
                <br />
                impulsa <em>tu mundo.</em>
              </h1>
              <p>
                Descubre celulares increíbles, elige cada detalle y encuentra el
                que mejor acompaña tu día a día.
              </p>
              <div className="hero-buttons">
                <Link className="button-dark" href="/celulares">
                  Explorar celulares <ArrowUpRight size={19} />
                </Link>
                <Link className="button-soft" href="/marcas">
                  Ver marcas <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hero-note">
                <div className="mini-avatars">
                  <span>JC</span>
                  <span>
                    <Smartphone size={13} />
                  </span>
                  <span>✦</span>
                </div>
                <p>Tu próximo favorito te está esperando</p>
              </div>
            </div>
            <div className="hero-image">
              <span className="hero-circle circle-a" />
              <span className="hero-circle circle-b" />
              <PhoneArtwork color="hero" />
              <div className="floating-note">
                <span className="floating-icon">
                  <Sparkles size={18} />
                </span>
                <span>
                  <strong>Hecho para ti</strong>
                  <small>Elige a tu manera</small>
                </span>
              </div>
              <span className="hero-side-text">
                EXPLORE · DISCOVER · CONNECT
              </span>
            </div>
          </div>
        </section>
        <section className="benefits-bar">
          <div className="store-container benefits-inner">
            <div>
              <ShieldCheck size={23} />
              <span>
                <strong>Compra con confianza</strong>
                <small>Equipos con garantía</small>
              </span>
            </div>
            <div>
              <Smartphone size={23} />
              <span>
                <strong>Variedad real</strong>
                <small>Elige tu combinación ideal</small>
              </span>
            </div>
            <div>
              <Headphones size={23} />
              <span>
                <strong>Atención cercana</strong>
                <small>Siempre para ayudarte</small>
              </span>
            </div>
          </div>
        </section>
        <section className="store-section store-container">
          <div className="section-top">
            <div>
              <span className="eyebrow">
                <span /> SELECCIÓN ESPECIAL
              </span>
              <h2>
                Encuentra tu <em>favorito.</em>
              </h2>
              <p>Una selección de equipos que vale la pena conocer.</p>
            </div>
            <Link className="section-link" href="/celulares">
              Ver todos los celulares <ArrowUpRight size={18} />
            </Link>
          </div>
          {shown.length ? (
            <div className="product-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">
                <Smartphone size={30} />
              </div>
              <h3>Pronto vas a encontrar tu favorito aquí.</h3>
              <p>
                Estamos preparando nuestro catálogo. Vuelve a visitarnos pronto.
              </p>
            </div>
          )}
        </section>
        <section className="feature-strip">
          <div className="store-container feature-inner">
            <div className="feature-visual">
              <PhoneArtwork color="lavender" />
              <span className="feature-spark">✳</span>
            </div>
            <div className="feature-copy">
              <span className="eyebrow">
                <span /> CADA DETALLE IMPORTA
              </span>
              <h2>
                Elige como
                <br />
                <em>más te gusta.</em>
              </h2>
              <p>
                Color, memoria y estilo. Explora todas las variantes y conoce
                cada especificación antes de elegir tu próximo equipo.
              </p>
              <Link className="button-dark" href="/celulares">
                Descubrir modelos <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
        <section className="store-section store-container">
          <div className="section-top">
            <div>
              <span className="eyebrow">
                <span /> DESCUBRÍ MÁS
              </span>
              <h2>
                Marcas para <em>inspirarte.</em>
              </h2>
              <p>Encuentra los modelos de tus fabricantes favoritos.</p>
            </div>
            <Link className="section-link" href="/marcas">
              Explorar marcas <ArrowUpRight size={18} />
            </Link>
          </div>
          {brands.length ? (
            <div className="brand-grid">
              {brands.map((b) => (
                <Link
                  href={`/celulares?marca=${encodeURIComponent(b)}`}
                  key={b}
                  className="brand-tile"
                >
                  <BrandMark brand={b} />
                  <strong>{b}</strong>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="brand-grid">
              <Link className="brand-tile" href="/marcas">
                <span className="brand-monogram">✦</span>
                <strong>Nuevas marcas próximamente</strong>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          )}
        </section>
        {offers.length > 0 && (
          <section className="store-section store-container offers-home">
            <div className="section-top">
              <div>
                <span className="eyebrow">
                  <span /> OPORTUNIDADES
                </span>
                <h2>
                  Para aprovechar <em>hoy.</em>
                </h2>
              </div>
              <Link className="section-link" href="/ofertas">
                Todas las ofertas <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="product-grid">
              {offers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        <section className="contact-banner store-container">
          <div>
            <span className="eyebrow">
              <span /> ESTAMOS PARA VOS
            </span>
            <h2>
              ¿Necesitas ayuda
              <br />
              para <em>decidir?</em>
            </h2>
            <p>
              Cuéntanos qué estás buscando. Te ayudamos a encontrar el equipo
              indicado.
            </p>
          </div>
          <Link href="/contacto" className="button-dark">
            Ponte en contacto <ArrowUpRight size={18} />
          </Link>
          <span className="banner-asterisk">✳</span>
        </section>
      </main>
      <StoreFooter
        name={name}
        address={settings?.address}
        phone={settings?.phone}
      />
      <StoreJsonLd
        name={name}
        address={settings?.address}
        phone={settings?.phone}
      />
    </>
  );
}
