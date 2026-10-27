import { AwsClient } from "aws4fetch";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

const read = (name: string) =>
  (process.env[name] || "").trim().replace(/^"|"$/g, "");

export function r2Config(): R2Config | null {
  const config = {
    accountId: read("R2_ACCOUNT_ID"),
    accessKeyId: read("R2_ACCESS_KEY_ID"),
    secretAccessKey: read("R2_SECRET_ACCESS_KEY"),
    bucket: read("R2_BUCKET"),
    publicUrl: read("R2_PUBLIC_URL").replace(/\/+$/, ""),
  };
  return Object.values(config).every(Boolean) ? config : null;
}

export const r2Configured = () => r2Config() !== null;

const extensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const objectKey = (extension: string) =>
  `products/${crypto.randomUUID()}.${
    extensions.has(extension) ? extension : "bin"
  }`;

export const objectUrl = (config: R2Config, key: string) =>
  `${config.publicUrl}/${key}`;

const endpoint = (config: R2Config, key: string) =>
  `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;

const client = (config: R2Config) =>
  new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  });

export async function uploadImage(
  config: R2Config,
  body: Uint8Array,
  contentType: string,
  extension: string,
) {
  const key = objectKey(extension);
  const response = await client(config).fetch(endpoint(config, key), {
    method: "PUT",
    body: body as BodyInit,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
  if (!response.ok)
    throw new Error(
      `R2 upload failed: ${response.status} ${(await response.text()).slice(0, 200)}`,
    );
  return objectUrl(config, key);
}

export async function deleteObject(config: R2Config, key: string) {
  const response = await client(config).fetch(endpoint(config, key), {
    method: "DELETE",
  });
  return response.ok;
}

/** Only URLs served by the configured bucket or the legacy database route. */
export function validImageUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return false;
  if (/^\/api\/images\/[a-z0-9]+$/.test(value)) return true;
  const config = r2Config();
  return (
    !!config &&
    value.startsWith(`${config.publicUrl}/products/`) &&
    !value.includes("..")
  );
}
