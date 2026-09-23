import type { MetadataRoute } from "next";
import { LOCALES } from "@/types/i18n";
import { getAllProducts } from "@/lib/products";

const BASE_URL = "https://elysiderm.vn";
const STATIC_ROUTES = ["", "/collections", "/about", "/technology", "/why-elysiderm", "/contact", "/privacy", "/returns", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();

  return LOCALES.flatMap((locale) => [
    ...STATIC_ROUTES.map((route) => ({ url: `${BASE_URL}/${locale}${route}`, lastModified: new Date() })),
    ...products.map((product) => ({
      url: `${BASE_URL}/${locale}/collections/${product.slug}`,
      lastModified: new Date(),
    })),
  ]);
}
