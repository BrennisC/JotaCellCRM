import { afterEach, beforeEach, expect, test } from "bun:test";
import { objectKey, objectUrl, r2Config, validImageUrl } from "./r2";

const base = "https://pub-abc123.r2.dev";
const original = { ...process.env };

beforeEach(() => {
  process.env.R2_ACCOUNT_ID = "account";
  process.env.R2_ACCESS_KEY_ID = "key";
  process.env.R2_SECRET_ACCESS_KEY = "secret";
  process.env.R2_BUCKET = "jota-cell";
  process.env.R2_PUBLIC_URL = `${base}/`;
});

afterEach(() => {
  process.env = { ...original };
});

test("config drops the trailing slash of the public url", () => {
  expect(r2Config()?.publicUrl).toBe(base);
  delete process.env.R2_BUCKET;
  expect(r2Config()).toBeNull();
});

test("object keys stay inside the products folder", () => {
  expect(objectKey("png")).toMatch(/^products\/[0-9a-f-]{36}\.png$/);
  const key = objectKey("png/../evil");
  expect(key).toStartWith("products/");
  expect(key).toEndWith(".bin");
  expect(key).not.toContain("..");
  expect(key).not.toContain("/evil");
});

test("object url joins the bucket public url", () => {
  expect(objectUrl(r2Config()!, "products/a.jpg")).toBe(
    `${base}/products/a.jpg`,
  );
});

test("only own bucket urls and legacy ids are accepted", () => {
  expect(validImageUrl(`${base}/products/a.jpg`)).toBe(true);
  expect(validImageUrl("/api/images/cuid123")).toBe(true);
  expect(validImageUrl("https://evil.example/products/a.jpg")).toBe(false);
  expect(validImageUrl(`${base}/other/a.jpg`)).toBe(false);
  expect(validImageUrl(`${base}/products/../secret`)).toBe(false);
  expect(validImageUrl("javascript:alert(1)")).toBe(false);
  expect(validImageUrl(null)).toBe(false);
});

test("without configuration only legacy ids are accepted", () => {
  delete process.env.R2_PUBLIC_URL;
  expect(validImageUrl(`${base}/products/a.jpg`)).toBe(false);
  expect(validImageUrl("/api/images/cuid123")).toBe(true);
});
