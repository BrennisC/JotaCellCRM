import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin, validOrigin } from "@/lib/security";
import { r2Config, uploadImage } from "@/lib/r2";

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
