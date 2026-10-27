import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { authClient, accessCookie } from "./supabase-auth";

export async function getAdmin() {
  const token = (await cookies()).get(accessCookie)?.value;
  if (!token) return null;
  try {
    const { data, error } = await authClient().auth.getUser(token);
    if (error || !data.user?.email) return null;
    const admin = await prisma.admin.findUnique({
      where: { supabaseUserId: data.user.id },
    });
    return admin?.email.toLowerCase() === data.user.email.toLowerCase()
      ? admin
      : null;
  } catch (cause) {
    console.error("Admin session verification failed", cause);
    return null;
  }
}

export const validOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  return !!origin && origin === expected;
};
