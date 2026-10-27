import {
  siApple,
  siAsus,
  siBlackberry,
  siFairphone,
  siGoogle,
  siHonor,
  siHtc,
  siHuawei,
  siKyocera,
  siLenovo,
  siLg,
  siMeizu,
  siMotorola,
  siNokia,
  siOneplus,
  siOppo,
  siPanasonic,
  siSamsung,
  siSharp,
  siSony,
  siToshiba,
  siVestel,
  siVivo,
  siXiaomi,
} from "simple-icons";

export type BrandIcon = { path: string; hex: string; title: string };

/** Brand name normalized to a lookup key: lowercase, no accents or symbols. */
export const brandKey = (brand: string) =>
  brand
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Official logos from Simple Icons. Brands outside this list fall back to initials. */
const brandIcons: Record<string, BrandIcon> = {
  apple: siApple,
  asus: siAsus,
  blackberry: siBlackberry,
  fairphone: siFairphone,
  google: siGoogle,
  honor: siHonor,
  htc: siHtc,
  huawei: siHuawei,
  kyocera: siKyocera,
  lenovo: siLenovo,
  lg: siLg,
  meizu: siMeizu,
  motorola: siMotorola,
  nokia: siNokia,
  oneplus: siOneplus,
  oppo: siOppo,
  panasonic: siPanasonic,
  samsung: siSamsung,
  sharp: siSharp,
  sony: siSony,
  sonyericsson: siSony,
  toshiba: siToshiba,
  vestel: siVestel,
  vivo: siVivo,
  xiaomi: siXiaomi,
};

export const brandIcon = (brand: string) => brandIcons[brandKey(brand)] ?? null;

/** Two-letter mark used when the brand has no official logo available. */
export const brandInitials = (brand: string) =>
  brand
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
