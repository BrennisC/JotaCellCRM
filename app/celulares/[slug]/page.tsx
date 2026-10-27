import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreHeader, StoreFooter } from "@/components/store-shell";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";
export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, include: { variants: true } }),
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
    </>
  );
}
