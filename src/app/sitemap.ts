import type { MetadataRoute } from "next";
import { LOCALES } from "@/types/i18n";

const BASE_URL = "https://elysiderm.vn";
const STATIC_ROUTES = ["", "/collections", "/about", "/technology", "/why-elysiderm", "/contact", "/privacy", "/returns", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
    })),
  );
}
