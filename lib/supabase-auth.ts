import { createClient, type Session } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const accessCookie = "jotacell_access";
export const refreshCookie = "jotacell_refresh";

export const authConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);

export function authClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase Auth is not configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function setAuthCookies(response: NextResponse, session: Session) {
  const shared = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
  response.cookies.set(accessCookie, session.access_token, {
    ...shared,
    maxAge: session.expires_in,
  });
  response.cookies.set(refreshCookie, session.refresh_token, {
    ...shared,
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(accessCookie);
  response.cookies.delete(refreshCookie);
  return response;
}
