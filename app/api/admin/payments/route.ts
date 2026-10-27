import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guarded, InputError, required } from "@/lib/api";
import { parseDate, toCents } from "@/lib/finance";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  return guarded(request, async (adminId) => {
    const d = await request.json();
    const saleId = required(d.saleId, "Venta"),
      kind = String(d.kind),
      key = required(d.key, "Identificador de operación");
    if (key.length > 100 || !["initial", "installment"].includes(kind))
      throw new InputError("Operación inválida.");
    const amount = toCents(d.amount),
      paidAt = parseDate(d.date),
      reference = String(d.reference || "").slice(0, 120);
    if (!amount) throw new InputError("El importe debe ser mayor a cero.");
    await prisma.$transaction(
      async (tx) => {
        await tx.paymentKey.create({ data: { key, saleId } });
        const sale = await tx.sale.findUnique({
          where: { id: saleId },
          include: {
            installments: { orderBy: { number: "asc" } },
            payments: true,
          },
        });
        if (!sale || sale.type !== "installments" || sale.status !== "active")
          throw new InputError("Venta en cuotas no activa.");
        if (kind === "initial") {
          const paid = sale.payments
            .filter((p) => p.kind === "initial")
            .reduce((sum, p) => sum + p.amountCents, 0);
          if (amount > sale.downCents - paid)
            throw new InputError("El pago supera la inicial pendiente.");
          await tx.payment.create({
            data: { saleId, kind, amountCents: amount, paidAt, reference },
          });
        } else {
          let remaining = amount;
          const outstanding = sale.installments.reduce(
            (sum, i) => sum + i.amountCents - i.paidCents,
            0,
          );
          if (remaining > outstanding)
            throw new InputError("El pago supera el saldo pendiente.");
          for (const item of sale.installments) {
            if (!remaining) break;
            const apply = Math.min(
              remaining,
              item.amountCents - item.paidCents,
            );
            if (!apply) continue;
            await tx.installment.update({
              where: { id: item.id },
              data: { paidCents: { increment: apply } },
            });
            await tx.payment.create({
              data: {
                saleId,
                installmentId: item.id,
                kind,
                amountCents: apply,
                paidAt,
                reference,
              },
            });
            remaining -= apply;
          }
        }
        await tx.auditLog.create({
          data: {
            adminId,
            action: "payment.created",
            entity: "sale",
            entityId: saleId,
            detail: { amount, kind, key },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ ok: true });
  });
}
