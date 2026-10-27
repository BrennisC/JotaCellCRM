import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    /* The sitemap still lists the static pages while the database is down. */
  }
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1, changeFrequency: "daily" },
    { url: `${base}/celulares`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/ofertas`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/marcas`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/contacto`, priority: 0.6, changeFrequency: "monthly" },
  ];
  return [
    ...pages,
    ...products.map((product) => ({
      url: `${base}/celulares/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
