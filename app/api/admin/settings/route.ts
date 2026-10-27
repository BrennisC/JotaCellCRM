import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guarded, InputError, required } from "@/lib/api";
import { whatsAppNumber } from "@/lib/inquiry";

export async function POST(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const phone = String(d.phone || "").slice(0, 80);
    if (phone && !whatsAppNumber(phone))
      throw new InputError(
        "WhatsApp inválido. Usa 9 dígitos (ej. 999 888 777) o el número con código de país.",
      );
    const data = {
      name: required(d.name, "Nombre de la tienda").slice(0, 100),
      address: String(d.address || "").slice(0, 250),
      phone,
      email: String(d.email || "").slice(0, 120),
      hours: String(d.hours || "").slice(0, 200),
      about: String(d.about || "").slice(0, 1000),
    };
    await prisma.$transaction([
      prisma.storeSettings.upsert({
        where: { id: 1 },
        create: { id: 1, ...data },
        update: data,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "settings.updated",
          entity: "store",
          entityId: "1",
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  });
}
