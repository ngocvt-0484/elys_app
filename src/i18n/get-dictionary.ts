import vi from "./dictionaries/vi.json";
import en from "./dictionaries/en.json";
import ko from "./dictionaries/ko.json";
import type { Locale } from "@/types/i18n";

const dictionaries = { vi, en, ko };

export type Dictionary = typeof vi;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
