import productsData from "@/data/products.json";
import bundlesData from "@/data/bundles.json";
import type { Product, Bundle } from "@/types/product";

const products = productsData as Product[];
const bundles = bundlesData as Bundle[];

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.collection === current.collection)
    .slice(0, limit);
}

export function getRoutineProducts(collection: string): Product[] {
  return products
    .filter((p) => p.collection === collection && p.routineStep !== undefined)
    .sort((a, b) => (a.routineStep ?? 0) - (b.routineStep ?? 0));
}

export function getBundleForCollection(collection: string): Bundle | undefined {
  return bundles.find((b) => b.collection === collection);
}
