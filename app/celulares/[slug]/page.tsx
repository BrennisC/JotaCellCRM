import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productImage } from "@/lib/catalog";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductDetail } from "@/components/product-detail";
import { ProductJsonLd } from "@/components/structured-data";

export const dynamic = "force-dynamic";

const getProduct = cache((slug: string) =>
  prisma.product.findUnique({ where: { slug }, include: { variants: true } }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.published)
    return { title: "Celular no encontrado", robots: { index: false } };
  const name = `${product.brand} ${product.model}`;
  const image = productImage(product.images);
  const description =
    product.description ||
    `${name} nuevo, con garantía. Consulta colores, capacidades y precio en soles.`;
  return {
    title: name,
    description,
    alternates: { canonical: `/celulares/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/celulares/${product.slug}`,
      title: `${name} | JOTACELL`,
      description,
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
  };
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProduct(slug),
    prisma.storeSettings.findUnique({ where: { id: 1 } }),
  ]);
  if (!product || !product.published) notFound();
  return (
    <>
      <StoreHeader name={settings?.name} />
      <ProductDetail
        product={JSON.parse(JSON.stringify(product))}
        storeName={settings?.name || "JOTACELL"}
        phone={settings?.phone}
      />
      <StoreFooter
        name={settings?.name}
        address={settings?.address}
        phone={settings?.phone}
      />
      <ProductJsonLd product={product} />
    </>
  );
}
