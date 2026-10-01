import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/types/i18n";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = nextLocale;
  return segments.join("/") || `/${nextLocale}`;
}

/**
 * hreflang alternates for a given route, keyed by locale + x-default.
 * `path` is the part after the locale segment, e.g. "" for the homepage or
 * "/collections/eirlys-glutathione-cream" for a product page.
 */
export function hreflangAlternates(path: string) {
  return {
    languages: {
      vi: localizedPath("vi", path),
      en: localizedPath("en", path),
      ko: localizedPath("ko", path),
      "x-default": localizedPath(DEFAULT_LOCALE, path),
    },
  };
}
