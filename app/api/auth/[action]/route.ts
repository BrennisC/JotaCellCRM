import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin, validOrigin } from "@/lib/security";
import { strongPassword } from "@/lib/password";
import {
  loginBlocked,
  loginKey,
  recordFailedLogin,
} from "@/lib/login-attempts";
import {
  accessCookie,
  authClient,
  authConfigured,
  clearAuthCookies,
  refreshCookie,
  setAuthCookies,
} from "@/lib/supabase-auth";

export const runtime = "nodejs";
type Context = { params: Promise<{ action: string }> };
const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

async function refresh(request: NextRequest, redirectTo?: string) {
  const token = request.cookies.get(refreshCookie)?.value;
  const failure = () =>
    redirectTo
      ? clearAuthCookies(
          NextResponse.redirect(new URL("/admin/login", request.url)),
        )
      : clearAuthCookies(
          error("Sesión vencida. Inicia sesión nuevamente.", 401),
        );
  if (!token) return failure();
  const { data, error: authError } = await authClient().auth.refreshSession({
    refresh_token: token,
  });
  const user = data.user,
    session = data.session;
  if (authError || !session || !user?.email) return failure();
  const admin = await prisma.admin.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!admin || admin.email.toLowerCase() !== user.email.toLowerCase())
    return failure();
  const next =
    redirectTo?.startsWith("/admin") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/admin";
  const response = redirectTo
    ? NextResponse.redirect(new URL(next, request.url))
    : NextResponse.json({ ok: true });
  return setAuthCookies(response, session);
}

export async function GET(request: NextRequest, context: Context) {
  const action = (await context.params).action;
  if (action === "refresh") {
    try {
      return await refresh(
        request,
        request.nextUrl.searchParams.get("next") || "/admin",
      );
    } catch {
      return clearAuthCookies(
        NextResponse.redirect(new URL("/admin/login", request.url)),
      );
    }
  }
  if (action !== "me") return error("No encontrado.", 404);
  try {
    const admin = await getAdmin();
    return admin
      ? NextResponse.json({ name: admin.name, email: admin.email })
      : error("No autorizado.", 401);
  } catch {
    return error("Servicio de autenticación no disponible.", 503);
  }
}

export async function POST(request: NextRequest, context: Context) {
  if (!validOrigin(request)) return error("Origen no permitido.", 403);
  const { action } = await context.params;
  if (action === "refresh") {
    try {
      return await refresh(request);
    } catch {
      return clearAuthCookies(
        error("Sesión vencida. Inicia sesión nuevamente.", 401),
      );
    }
  }
  try {
    const data = await request.json().catch(() => null);
    if (!data || typeof data !== "object")
      return error("Solicitud inválida.", 400);
    if (action === "login") {
      const email = String(data.email || "")
        .trim()
        .toLowerCase();
      if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        return error("Correo o contraseña incorrectos.", 401);
      const key = loginKey(email);
      if (await loginBlocked(key))
        return error(
          "Demasiados intentos. Inténtalo de nuevo en 15 minutos.",
          429,
        );
      if (!authConfigured())
        return error(
          "El acceso aún no está configurado. Falta SUPABASE_PUBLISHABLE_KEY en .env.local.",
          503,
        );
      const client = authClient();
      const { data: result, error: authError } =
        await client.auth.signInWithPassword({
          email,
          password: String(data.password || ""),
        });
      if (authError || !result.session || !result.user) {
        await recordFailedLogin(key);
        return error("Correo o contraseña incorrectos.", 401);
      }
      const admin = await prisma.admin.findUnique({
        where: { supabaseUserId: result.user.id },
      });
      if (
        !admin ||
        admin.email.toLowerCase() !== result.user.email?.toLowerCase()
      ) {
        await client.auth.signOut({ scope: "local" });
        return error("Correo o contraseña incorrectos.", 401);
      }
      await prisma.loginAttempt.deleteMany({ where: { key } });
      return setAuthCookies(NextResponse.json({ ok: true }), result.session);
    }
    if (action === "logout") {
      const access = request.cookies.get(accessCookie)?.value;
      const token = request.cookies.get(refreshCookie)?.value;
      if (access && token) {
        const client = authClient();
        const { error: sessionError } = await client.auth.setSession({
          access_token: access,
          refresh_token: token,
        });
        if (!sessionError) await client.auth.signOut({ scope: "local" });
      }
      return clearAuthCookies(NextResponse.json({ ok: true }));
    }
    const admin = await getAdmin();
    if (!admin) return error("No autorizado.", 401);
    if (action === "password") {
      if (!strongPassword(data.next))
        return error(
          "Usa 12 o más caracteres con mayúscula, minúscula, número y símbolo.",
        );
      const client = authClient();
      const signed = await client.auth.signInWithPassword({
        email: admin.email,
        password: String(data.current || ""),
      });
      if (signed.error || !signed.data.session)
        return error("Contraseña actual incorrecta.");
      const updated = await client.auth.updateUser({
        password: data.next,
        current_password: String(data.current),
      });
      if (updated.error) return error("No se pudo actualizar la contraseña.");
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "password.changed",
          entity: "admin",
          entityId: admin.id,
        },
      });
      await client.auth.signOut({ scope: "global" });
      return clearAuthCookies(NextResponse.json({ ok: true, signedOut: true }));
    }
    return error("No encontrado.", 404);
  } catch (cause) {
    console.error("Auth request failed", cause);
    return error("No se pudo completar la operación.", 500);
  }
}
