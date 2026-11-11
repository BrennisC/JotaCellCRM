import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin, validOrigin } from "@/lib/security";
import { guarded } from "@/lib/api";
import {
  deleteObject,
  objectKeyFromUrl,
  r2Config,
  uploadImage,
  validImageUrl,
} from "@/lib/r2";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 },
    );
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size > 4 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    return NextResponse.json(
      { error: "Selecciona una imagen JPG, PNG o WebP de hasta 4 MB." },
      { status: 400 },
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(
    (file.type === "image/jpeg" && jpg) ||
    (file.type === "image/png" && png) ||
    (file.type === "image/webp" && webp)
  ))
    return NextResponse.json(
      { error: "El archivo no coincide con el formato de imagen." },
      { status: 400 },
    );
  const config = r2Config();
  if (config) {
    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    try {
      const url = await uploadImage(config, bytes, file.type, extension);
      return NextResponse.json({ url });
    } catch (cause) {
      console.error("R2 upload failed", cause);
      return NextResponse.json(
        { error: "No se pudo subir la imagen al almacenamiento." },
        { status: 502 },
      );
    }
  }
  const image = await prisma.productImage.create({
    data: { mime: file.type, content: bytes },
  });
  return NextResponse.json({ url: `/api/images/${image.id}` });
}

/** Removes images that no product references yet (discarded uploads). */
export async function DELETE(request: NextRequest) {
  return guarded(request, async () => {
    const body = (await request.json().catch(() => null)) as {
      urls?: unknown;
    } | null;
    const urls = Array.isArray(body?.urls)
      ? [
          ...new Set(
            body.urls.filter((url): url is string => typeof url === "string"),
          ),
        ].slice(0, 20)
      : [];
    if (!urls.length) return NextResponse.json({ removed: 0 });

    const products = await prisma.product.findMany({
      select: { images: true },
    });
    const used = new Set<string>();
    for (const product of products)
      if (Array.isArray(product.images))
        for (const image of product.images)
          if (typeof image === "string") used.add(image);

    const config = r2Config();
    let removed = 0;
    for (const url of urls) {
      if (!validImageUrl(url) || used.has(url)) continue;
      const legacyId = /^\/api\/images\/([a-z0-9]+)$/.exec(url)?.[1];
      if (legacyId) {
        const result = await prisma.productImage.deleteMany({
          where: { id: legacyId },
        });
        removed += result.count;
        continue;
      }
      const key = config ? objectKeyFromUrl(config, url) : null;
      if (config && key && (await deleteObject(config, key))) removed++;
    }
    return NextResponse.json({ removed });
  });
}
