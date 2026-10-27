import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/security";

export const runtime = "nodejs";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await prisma.productImage.findUnique({
    where: { id },
    select: {
      mime: true,
      content: true,
      product: { select: { published: true } },
    },
  });
  if (!image || (!image.product?.published && !(await getAdmin())))
    return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(image.content), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
