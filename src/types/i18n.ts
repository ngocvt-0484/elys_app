export const LOCALES = ["vi", "en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

export interface LocalizedText {
  vi: string;
  en: string;
  ko: string;
}
