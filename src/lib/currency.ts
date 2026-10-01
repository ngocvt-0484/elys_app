import type { Locale } from "@/types/i18n";

// Fixed approximate rates (not live FX) — this is a lead-gen site with no real
// checkout, so a static rate per currency is enough. The KRW rate matches the
// ratio already implied by `krwReferencePrice` in products.json (680,000₫ ≈ ₩37,000).
const VND_PER_USD = 25000;
const VND_PER_KRW = 18.4;

export function formatPrice(amountVnd: number, locale: Locale): string {
  switch (locale) {
    case "en":
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        amountVnd / VND_PER_USD
      );
    case "ko":
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      }).format(Math.round(amountVnd / VND_PER_KRW));
    case "vi":
    default:
      return `${amountVnd.toLocaleString("vi-VN")}₫`;
  }
}
