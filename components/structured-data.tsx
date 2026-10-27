import type { Product, Variant } from "@prisma/client";
import { whatsAppNumber } from "@/lib/inquiry";
import { absoluteUrl } from "@/lib/site";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Store information for the home page. */
export function StoreJsonLd({
  name,
  phone,
  address,
}: {
  name: string;
  phone?: string | null;
  address?: string | null;
}) {
  const number = phone ? whatsAppNumber(phone) : "";
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Store",
        name,
        url: absoluteUrl("/"),
        image: absoluteUrl("/jotacell-mark.svg"),
        priceRange: "S/",
        currenciesAccepted: "PEN",
        areaServed: "PE",
        ...(number ? { telephone: `+${number}` } : {}),
        ...(address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: address,
                addressCountry: "PE",
              },
            }
          : {}),
      }}
    />
  );
}

/** Product information for a phone detail page, prices in soles. */
export function ProductJsonLd({
  product,
}: {
  product: Product & { variants: Variant[] };
}) {
  const url = absoluteUrl(`/celulares/${product.slug}`);
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image): image is string => typeof image === "string",
      )
    : [];
  const prices = product.variants.map((v) => v.salePriceCents ?? v.priceCents);
  const available = product.variants.some((v) => v.stock > 0);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${product.brand} ${product.model}`,
        sku: product.slug,
        description:
          product.description ||
          `${product.brand} ${product.model} nuevo, con garantía. Consulta colores, capacidades y precio en soles.`,
        brand: { "@type": "Brand", name: product.brand },
        category: "Celulares",
        ...(images.length ? { image: images } : {}),
        itemCondition: "https://schema.org/NewCondition",
        ...(prices.length
          ? {
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "PEN",
                price: (Math.min(...prices) / 100).toFixed(2),
                availability: available
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "JOTACELL" },
              },
            }
          : {}),
      }}
    />
  );
}
