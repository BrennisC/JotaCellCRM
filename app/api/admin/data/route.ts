import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/security";

export const runtime = "nodejs";
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin)
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    const [products, sales, settings] = await Promise.all([
      prisma.product.findMany({
        include: { variants: { include: { serials: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.findMany({
        include: {
          variant: { include: { product: true } },
          installments: { orderBy: { number: "asc" } },
          payments: { orderBy: { paidAt: "desc" } },
        },
        orderBy: { soldAt: "desc" },
      }),
      prisma.storeSettings.findUnique({ where: { id: 1 } }),
    ]);
    return NextResponse.json({
      products,
      sales,
      settings,
      admin: { name: admin.name, email: admin.email },
    });
  } catch (e) {
    console.error("Admin data failed", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los datos." },
      { status: 503 },
    );
  }
}
