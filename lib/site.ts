/** Public site url used for canonical links, the sitemap and structured data. */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const absoluteUrl = (path = "/") =>
  `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
