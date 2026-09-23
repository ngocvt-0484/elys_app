import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, localizedPath } from "@/lib/locale";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getRoutineProducts,
  getBundleForCollection,
} from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const locale: Locale = params.locale;
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.shortDescription[locale],
    openGraph: {
      title: product.name[locale],
      description: product.shortDescription[locale],
      images: product.images,
    },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product.slug);
  const routineProducts = getRoutineProducts(product.collection);
  const bundle = getBundleForCollection(product.collection);
  const allProducts = getAllProducts();
  const badgeDict = dict.product.badges as Record<string, string>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <nav className="text-xs text-black/50">
        <Link href={localizedPath(locale, "/")}>{dict.product.breadcrumbHome}</Link>
        {" / "}
        <Link href={localizedPath(locale, "/collections")}>{dict.product.breadcrumbCollections}</Link>
        {" / "}
        <span>{product.name[locale]}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div>
          {product.badges && product.badges.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span key={badge} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium">
                  {badgeDict[badge] ?? badge}
                </span>
              ))}
            </div>
          )}
          <img
            src={product.images[0]}
            alt={product.name[locale]}
            width={600}
            height={600}
            className="w-full rounded-2xl object-cover"
          />
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt={product.name[locale]}
                  width={150}
                  height={150}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gold-dark">{dict.product.labInfo}</p>
          <h1 className="mt-2 font-heading text-3xl">{product.name[locale]}</h1>
          {product.subtitle && <p className="mt-2 text-sm italic text-black/70">{product.subtitle[locale]}</p>}
          <p className="mt-2 text-sm text-black/60">
            {dict.product.ratingLabel
              .replace("{rating}", product.rating.toFixed(1))
              .replace("{count}", String(product.reviewCount))}
          </p>
          {product.soldCount && (
            <p className="text-sm text-black/60">
              {dict.product.soldLabel.replace("{count}", String(product.soldCount))}
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-medium">{product.price.toLocaleString("vi-VN")}₫</p>
            {product.originalPrice && (
              <p className="text-sm text-black/40 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}₫
              </p>
            )}
          </div>
          {product.krwReferencePrice && (
            <p className="mt-1 text-xs text-black/50">
              {dict.product.krwReferenceLabel}: {product.krwReferencePrice.toLocaleString("ko-KR")}₩
            </p>
          )}

          {product.philosophyQuote && (
            <blockquote className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-sm italic text-black/70">
              <p className="mb-2 text-xs font-medium not-italic uppercase tracking-wide text-gold-dark">
                {dict.product.philosophyLabel}
              </p>
              {product.philosophyQuote[locale]}
            </blockquote>
          )}

          {product.keyActives && product.keyActives.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium">{dict.product.keyActivesLabel}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {product.keyActives.map((active) => (
                  <li key={active.name} className="rounded-xl border border-black/5 bg-white p-3 text-sm">
                    <p className="font-medium">
                      {active.name}
                      {active.percentage ? ` (${active.percentage})` : ""}
                    </p>
                    <p className="mt-1 text-black/60">{active.description[locale]}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.stockCount && (
            <p className="mt-6 text-sm text-black/60">
              {dict.product.stockLabel.replace("{count}", String(product.stockCount))}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href="#consult" className="flex-1 rounded-full bg-black px-6 py-3 text-center text-sm font-medium text-ivory">
              {dict.product.consultAndBuy}
            </a>
            <a href="#consult" className="flex-1 rounded-full border border-black px-6 py-3 text-center text-sm font-medium">
              {dict.product.addToCart}
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dict.product.trust.map((item) => (
              <div key={item.title} className="rounded-xl border border-black/5 bg-white p-3 text-center text-xs">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-black/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {routineProducts.length > 1 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.routineTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-black/70">{dict.product.routineDescription}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {routineProducts.map((step) => (
              <div
                key={step.slug}
                className={`rounded-2xl border p-5 ${
                  step.slug === product.slug ? "border-gold-dark bg-gold/10" : "border-black/5 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-black/50">
                  {dict.product.routineStepLabel.replace("{n}", String(step.routineStep))}
                </p>
                <h3 className="mt-2 font-medium">{step.name[locale]}</h3>
                <p className="mt-2 text-sm text-black/60">{step.price.toLocaleString("vi-VN")}₫</p>
                {step.slug === product.slug ? (
                  <p className="mt-3 text-xs font-medium text-gold-dark">{dict.product.routineSelected}</p>
                ) : (
                  <Link
                    href={localizedPath(locale, `/collections/${step.slug}`)}
                    className="mt-3 inline-block text-xs font-medium underline"
                  >
                    {dict.product.routineViewDetail}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {bundle && (
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-black p-6 text-ivory sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg">{bundle.name[locale]}</p>
                <p className="mt-1 text-sm text-ivory/70">{bundle.description[locale]}</p>
              </div>
              <a href="#consult" className="whitespace-nowrap rounded-full bg-gold px-6 py-3 text-sm font-medium text-black">
                {dict.product.bundleCta} {bundle.bundlePrice.toLocaleString("vi-VN")}₫
              </a>
            </div>
          )}
        </div>
      )}

      {product.ingredientStats && product.ingredientStats.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.technology}</h2>
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-dark">{dict.product.scienceFirstTitle}</p>
            <p className="mt-2 text-sm text-black/70">{dict.product.scienceFirstBody}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.ingredientStats.map((stat) => (
              <div key={stat.label[locale]} className="rounded-xl border border-black/5 bg-white p-4">
                <p className="font-heading text-2xl">{stat.value}</p>
                <p className="mt-1 text-sm text-black/60">{stat.label[locale]}</p>
              </div>
            ))}
          </div>
          {product.fullIngredientList && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">{dict.product.inciLabel}</p>
              <p className="mt-2 text-xs text-black/60">{product.fullIngredientList.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {product.usageSteps && product.usageSteps.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.usage}</h2>
          <ol className="mt-4 space-y-3 text-sm text-black/70">
            {product.usageSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-heading text-gold-dark">{index + 1}.</span>
                <span>{step[locale]}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.reviews}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.author} className="rounded-xl border border-black/5 bg-white p-4">
                <p className="text-sm font-medium">
                  {review.author} · {review.rating.toFixed(1)}★
                </p>
                <p className="mt-2 text-sm text-black/70">{review.text[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.relatedTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} locale={locale} />
            ))}
          </div>
        </div>
      )}

      <div id="consult" className="mt-20 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-heading text-2xl">{dict.product.consultAndBuy}</h2>
        <div className="mt-6">
          <LeadForm
            locale={locale}
            dict={dict}
            source="product-detail"
            products={allProducts}
            defaultInterest={product.slug}
          />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name[locale],
            description: (product.description ?? product.shortDescription)[locale],
            image: product.images,
            offers: {
              "@type": "Offer",
              priceCurrency: "VND",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          }),
        }}
      />
    </section>
  );
}
