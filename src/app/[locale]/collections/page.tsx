import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import { getAllProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.collections.title, description: dict.collections.description };
}

export default function CollectionsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.collections.title}</h1>
      <p className="mt-3 max-w-xl text-sm text-black/70">{dict.collections.description}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
