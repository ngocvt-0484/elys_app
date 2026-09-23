import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Product } from "@/types/product";
import { localizedPath } from "@/lib/locale";

export default function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={localizedPath(locale, `/collections/${product.slug}`)}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white"
    >
      <img
        src={product.images[0]}
        alt={product.name[locale]}
        width={480}
        height={480}
        className="aspect-square w-full object-cover transition group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="font-heading text-lg">{product.name[locale]}</h3>
        <p className="mt-2 text-sm text-black/70">{product.shortDescription[locale]}</p>
        <p className="mt-3 font-medium">{product.price.toLocaleString("vi-VN")}₫</p>
      </div>
    </Link>
  );
}
