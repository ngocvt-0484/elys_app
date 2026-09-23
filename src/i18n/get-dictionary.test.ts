import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";
import { LOCALES } from "@/types/i18n";

describe("getDictionary", () => {
  it("returns a dictionary for every supported locale", () => {
    for (const locale of LOCALES) {
      expect(getDictionary(locale).nav.home).toBeTruthy();
    }
  });

  it("returns locale-appropriate content", () => {
    expect(getDictionary("vi").nav.home).toBe("Trang chủ");
    expect(getDictionary("en").nav.home).toBe("Home");
    expect(getDictionary("ko").nav.home).toBe("홈");
  });

  it("keeps the same nav keys across all locales", () => {
    const viKeys = Object.keys(getDictionary("vi").nav).sort();
    const enKeys = Object.keys(getDictionary("en").nav).sort();
    const koKeys = Object.keys(getDictionary("ko").nav).sort();
    expect(enKeys).toEqual(viKeys);
    expect(koKeys).toEqual(viKeys);
  });
});
