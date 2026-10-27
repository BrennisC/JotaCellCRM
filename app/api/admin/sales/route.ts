import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guarded, InputError, integer, required } from "@/lib/api";
import { parseDate, schedule, toCents } from "@/lib/finance";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const code = required(d.code, "Código"),
      variantId = required(d.variantId, "Variante");
    const soldAt = parseDate(d.date),
      priceCents = toCents(d.price),
      downCents = toCents(d.down ?? "0");
    const type = String(d.type),
      frequency = String(d.frequency || "monthly");
    const installmentsNo =
      type === "installments" ? integer(d.installmentsNo, "Cuotas") : 0;
    if (
      !["cash", "installments"].includes(type) ||
      priceCents <= 0 ||
      downCents > priceCents ||
      (type === "cash" && downCents !== 0)
    )
      throw new InputError("Condiciones de venta inválidas.");
    const plan =
      type === "installments"
        ? schedule(soldAt, installmentsNo, frequency, priceCents - downCents)
        : [];
    const imei = String(d.imei || "").trim();
    // Serializable transaction plus conditional stock decrement prevents overselling under concurrent requests.
    const sale = await prisma.$transaction(
      async (tx) => {
        const variant = await tx.variant.updateMany({
          where: { id: variantId, stock: { gt: 0 } },
          data: { stock: { decrement: 1 } },
        });
        if (variant.count !== 1)
          throw new InputError("No hay stock disponible para esta variante.");
        if (imei) {
          const serial = await tx.deviceSerial.updateMany({
            where: { variantId, imei, sold: false },
            data: { sold: true },
          });
          if (serial.count !== 1)
            throw new InputError("IMEI no registrado o ya vendido.");
        }
        const created = await tx.sale.create({
          data: {
            code,
            soldAt,
            variantId,
            imei: imei || null,
            buyerName: required(d.buyerName, "Comprador"),
            buyerDocument: required(d.buyerDocument, "Documento"),
            buyerPhone: String(d.buyerPhone || ""),
            priceCents,
            downCents,
            type,
            frequency,
            installmentsNo,
            installments: { create: plan },
          },
        });
        if (type === "cash")
          await tx.payment.create({
            data: {
              saleId: created.id,
              amountCents: priceCents,
              kind: "cash",
              paidAt: soldAt,
              reference: "Venta al contado",
            },
          });
        await tx.auditLog.create({
          data: {
            adminId,
            action: "sale.created",
            entity: "sale",
            entityId: created.id,
            detail: { priceCents, type } as Prisma.InputJsonValue,
          },
        });
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ id: sale.id });
  });
}

export async function PATCH(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const id = required(d.id, "Venta");
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        buyerName: required(d.buyerName, "Comprador"),
        buyerDocument: required(d.buyerDocument, "Documento"),
        buyerPhone: String(d.buyerPhone || ""),
      },
    });
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "sale.updated",
        entity: "sale",
        entityId: sale.id,
      },
    });
    return NextResponse.json({ ok: true });
  });
}
