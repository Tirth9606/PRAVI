import { en, type Dictionary } from "./en";
import { hi } from "./hi";
import { gu } from "./gu";

export type Locale = "en" | "hi" | "gu";
export const LOCALES: Locale[] = ["en", "hi", "gu"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "roadgov_locale";

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, gu };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "hi" || value === "gu";
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export type { Dictionary };
