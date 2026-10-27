import type { CSSProperties } from "react";
import { brandIcon, brandInitials } from "@/lib/brand-icons";

/**
 * Official brand logo when available, two-letter mark otherwise.
 * Decorative: the brand name is always rendered next to it.
 */
export function BrandMark({ brand }: { brand: string }) {
  const icon = brandIcon(brand);
  if (!icon)
    return (
      <span className="brand-monogram" aria-hidden="true">
        {brandInitials(brand)}
      </span>
    );
  return (
    <span
      className="brand-logo"
      aria-hidden="true"
      style={{ "--brand-color": `#${icon.hex}` } as CSSProperties}
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <path d={icon.path} fill="currentColor" />
      </svg>
    </span>
  );
}
