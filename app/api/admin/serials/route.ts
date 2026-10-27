import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guarded, InputError, required } from "@/lib/api";

export async function POST(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const imei = required(d.imei, "IMEI o serie");
    if (imei.length > 80) throw new InputError("IMEI demasiado largo.");
    const serial = await prisma.deviceSerial.create({
      data: { variantId: required(d.variantId, "Variante"), imei },
    });
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "serial.created",
        entity: "serial",
        entityId: serial.id,
      },
    });
    return NextResponse.json({ id: serial.id });
  });
}
