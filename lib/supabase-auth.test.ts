import { expect, test } from "bun:test";
import { NextResponse } from "next/server";
import type { Session } from "@supabase/supabase-js";
import {
  accessCookie,
  clearAuthCookies,
  refreshCookie,
  setAuthCookies,
} from "./supabase-auth";

test("JWT and refresh token are sent only as HttpOnly strict cookies", () => {
  const session = {
    access_token: "jwt-value",
    refresh_token: "refresh-value",
    expires_in: 3600,
  } as Session;
  const response = setAuthCookies(NextResponse.json({ ok: true }), session);
  const cookies = response.headers.getSetCookie();
  expect(cookies.length).toBe(2);
  expect(
    cookies.every(
      (cookie) =>
        cookie.includes("HttpOnly") && cookie.includes("SameSite=strict"),
    ),
  ).toBe(true);
  expect(response.cookies.get(accessCookie)?.value).toBe("jwt-value");
  expect(response.cookies.get(refreshCookie)?.value).toBe("refresh-value");
  const logout = clearAuthCookies(NextResponse.json({ ok: true }));
  expect(
    logout.headers
      .getSetCookie()
      .every((cookie) => cookie.includes("Expires=Thu, 01 Jan 1970")),
  ).toBe(true);
});
