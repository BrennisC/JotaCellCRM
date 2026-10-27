import {
  deleteObject,
  objectKey,
  objectUrl,
  r2Config,
  uploadImage,
} from "../lib/r2";

const config = r2Config();
if (!config) {
  console.error("Faltan variables R2_* en .env.local");
  process.exit(1);
}

const bucketEndpoint = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}`;
let failures = 0;
const report = (label: string, ok: boolean, detail = "") => {
  if (!ok) failures++;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`,
  );
};

const { AwsClient } = await import("aws4fetch");
const client = new AwsClient({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  service: "s3",
  region: "auto",
});

try {
  const head = await client.fetch(bucketEndpoint, { method: "HEAD" });
  report("credenciales y bucket", head.ok, `HTTP ${head.status}`);
} catch (error) {
  report("credenciales y bucket", false, (error as Error).message);
}

const ext = "txt";
const key = objectKey(ext);
try {
  const body = new TextEncoder().encode(
    `jotacell-r2-check ${new Date().toISOString()}`,
  );
  const url = await uploadImage(config, body, "text/plain", ext);
  report(
    "escritura (PUT)",
    url === objectUrl(config, key) || url.length > 0,
    url,
  );

  const target = new URL(url);
  const publicResponse = await fetch(`${target.href}?cb=${Date.now()}`);
  const text = (await publicResponse.text()).slice(0, 80);
  report(
    "lectura pública",
    publicResponse.ok,
    `HTTP ${publicResponse.status} ${text}`,
  );

  const removed = await deleteObject(
    config,
    url.slice(config.publicUrl.length + 1),
  );
  report("limpieza (DELETE)", removed);
} catch (error) {
  report("escritura/lectura", false, (error as Error).message);
}

process.exit(failures ? 1 : 0);
