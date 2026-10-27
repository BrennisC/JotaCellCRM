import { NextRequest, NextResponse } from "next/server";
import { getAdmin, validOrigin } from "./security";
import { InputError } from "./validation";

export { InputError, integer, required } from "./validation";

export const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });
export async function guarded(
  request: NextRequest,
  task: (adminId: string) => Promise<NextResponse>,
) {
  if (!validOrigin(request)) return fail("Origen no permitido.", 403);
  try {
    const admin = await getAdmin();
    if (!admin) return fail("No autorizado.", 401);
    return await task(admin.id);
  } catch (e) {
    if (e instanceof InputError) return fail(e.message);
    if (
      e instanceof Error &&
      ["P2002", "P2025"].includes((e as Error & { code?: string }).code || "")
    )
      return fail("Ya existe este código, variante o identificador.");
    console.error("Admin operation failed", e);
    return fail("No se pudo completar la operación.", 500);
  }
}
