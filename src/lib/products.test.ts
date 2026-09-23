import { describe, it, expect } from "vitest";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  getRoutineProducts,
  getBundleForCollection,
} from "./products";

describe("products data layer", () => {
  it("returns all products", () => {
    expect(getAllProducts().length).toBeGreaterThan(0);
  });

  it("finds a product by slug", () => {
    const product = getProductBySlug("eirlys-alpha-melight-intensive-cream");
    expect(product?.name.en).toBe("Eirlys' Alpha-Melight™ Intensive Cream");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });

  it("returns only featured products", () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("returns related products from the same collection, excluding itself", () => {
    const related = getRelatedProducts("eirlys-alpha-melight-intensive-cream");
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.collection === "alpha-melight")).toBe(true);
    expect(related.some((p) => p.slug === "eirlys-alpha-melight-intensive-cream")).toBe(false);
  });

  it("returns routine products sorted by routineStep ascending", () => {
    const routine = getRoutineProducts("alpha-melight");
    expect(routine.map((p) => p.routineStep)).toEqual([1, 2, 3]);
  });

  it("finds the bundle matching a collection", () => {
    const bundle = getBundleForCollection("alpha-melight");
    expect(bundle?.bundlePrice).toBe(1440000);
  });

  it("returns undefined when no bundle exists for a collection", () => {
    expect(getBundleForCollection("cleanser")).toBeUndefined();
  });
});
