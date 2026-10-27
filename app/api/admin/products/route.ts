import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guarded, InputError, integer, required } from "@/lib/api";
import { toCents } from "@/lib/finance";
import { defaultCondition, isCondition } from "@/lib/conditions";

export const runtime = "nodejs";
const allowedSpecs = [
  "Pantalla",
  "Dimensiones y peso",
  "Procesador",
  "Memoria",
  "Cámaras",
  "Batería",
  "Conectividad",
  "Sistema operativo",
  "Otras características",
];
export async function POST(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const slug = required(d.slug, "Identificador").toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new InputError(
        "El identificador debe contener letras minúsculas, números o guiones.",
      );
    if (
      !Array.isArray(d.images) ||
      d.images.some(
        (x: unknown) =>
          typeof x !== "string" || !/^\/api\/images\/[a-z0-9]+$/.test(x),
      )
    )
      throw new InputError("Imágenes inválidas.");
    const specs =
      d.specs && typeof d.specs === "object" && !Array.isArray(d.specs)
        ? d.specs
        : {};
    if (
      Object.keys(specs).some((k) => !allowedSpecs.includes(k)) ||
      Object.values(specs).some(
        (v) =>
          !v ||
          typeof v !== "object" ||
          Array.isArray(v) ||
          Object.values(v).some((x) => typeof x !== "string"),
      )
    )
      throw new InputError("Especificaciones inválidas.");
    const values = {
      slug,
      brand: required(d.brand, "Marca"),
      model: required(d.model, "Modelo"),
      description: String(d.description || ""),
      warranty: String(d.warranty || "12 meses"),
      condition: isCondition(d.condition) ? d.condition : defaultCondition,
      featured: d.featured === true,
      published: d.published === true,
      images: d.images as Prisma.InputJsonValue,
      specs: specs as Prisma.InputJsonValue,
    };
    const product = d.id
      ? await prisma.product.update({
          where: { id: String(d.id) },
          data: values,
        })
      : await prisma.product.create({ data: values });
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: {
          id: { in: d.images.map((url: string) => url.split("/").pop()!) },
          productId: null,
        },
        data: { productId: product.id },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: d.id ? "product.updated" : "product.created",
          entity: "product",
          entityId: product.id,
        },
      }),
    ]);
    return NextResponse.json({ id: product.id });
  });
}

export async function PATCH(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const productId = required(d.productId, "Producto");
    const values = {
      color: required(d.color, "Color"),
      colorHex: /^#[0-9a-fA-F]{6}$/.test(String(d.colorHex))
        ? String(d.colorHex)
        : "#dceaf4",
      ram: required(d.ram, "RAM"),
      storage: required(d.storage, "Almacenamiento"),
      priceCents: toCents(d.price),
      salePriceCents: d.salePrice ? toCents(d.salePrice) : null,
      stock: integer(d.stock, "Stock"),
    };
    if (
      values.priceCents <= 0 ||
      (values.salePriceCents !== null &&
        (values.salePriceCents <= 0 ||
          values.salePriceCents >= values.priceCents))
    )
      throw new InputError(
        "Precios inválidos. La oferta debe ser menor que el precio regular.",
      );
    const variant = d.id
      ? await prisma.variant.update({
          where: { id: String(d.id), productId },
          data: values,
        })
      : await prisma.variant.create({ data: { productId, ...values } });
    await prisma.auditLog.create({
      data: {
        adminId,
        action: d.id ? "variant.updated" : "variant.created",
        entity: "variant",
        entityId: variant.id,
        detail: { stock: values.stock },
      },
    });
    return NextResponse.json({ id: variant.id });
  });
}

export async function DELETE(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const { id } = await request.json();
    const product = await prisma.product.findUnique({
      where: { id: required(id, "Producto") },
      include: {
        variants: { select: { _count: { select: { sales: true } } } },
      },
    });
    if (!product) throw new InputError("Producto no encontrado.");
    const hasSales = product.variants.some((v) => v._count.sales > 0);
    if (hasSales) {
      await prisma.product.update({
        where: { id: product.id },
        data: { published: false, featured: false },
      });
    } else {
      await prisma.product.delete({ where: { id: product.id } });
    }
    await prisma.auditLog.create({
      data: {
        adminId,
        action: hasSales ? "product.archived" : "product.deleted",
        entity: "product",
        entityId: product.id,
      },
    });
    return NextResponse.json({ archived: hasSales });
  });
}
