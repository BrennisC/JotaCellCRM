import { prisma } from "./prisma";

export async function catalog() {
  return prisma.product.findMany({
    where: { published: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}
export const productImage = (images: unknown): string => {
  if (!Array.isArray(images)) return "";
  const first = images[0];
  return typeof first === "string"
    ? first
    : typeof first === "object" &&
        first &&
        "url" in first &&
        typeof first.url === "string"
      ? first.url
      : "";
};
