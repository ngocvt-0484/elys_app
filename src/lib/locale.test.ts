import { describe, it, expect } from "vitest";
import { isLocale, localizedPath, replaceLocaleInPath } from "./locale";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ko")).toBe(true);
  });

  it("rejects unsupported locales", () => {
    expect(isLocale("fr")).toBe(false);
  });
});

describe("localizedPath", () => {
  it("builds the home path for a locale", () => {
    expect(localizedPath("vi", "/")).toBe("/vi");
  });

  it("prefixes a nested path with the locale", () => {
    expect(localizedPath("en", "/collections")).toBe("/en/collections");
  });

  it("adds a leading slash when missing", () => {
    expect(localizedPath("ko", "contact")).toBe("/ko/contact");
  });
});

describe("replaceLocaleInPath", () => {
  it("swaps the locale segment while keeping the rest of the path", () => {
    expect(replaceLocaleInPath("/vi/collections/eirlys-x", "en")).toBe("/en/collections/eirlys-x");
  });

  it("works for the locale root path", () => {
    expect(replaceLocaleInPath("/vi", "ko")).toBe("/ko");
  });
});
