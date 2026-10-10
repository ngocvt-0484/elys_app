import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import LeadForm from "@/components/LeadForm";
import { CheckCircleIcon, DiamondIcon, DropletIcon, LeafDuoIcon, SparkleIcon } from "@/components/icons";

// Literal class names so Tailwind picks them up; keyed by item count.
const mdGridCols: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};
const benefitIcons = [DropletIcon, SparkleIcon, DiamondIcon, LeafDuoIcon];
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, localizedPath, hreflangAlternates } from "@/lib/locale";
import { formatPrice } from "@/lib/currency";
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
    alternates: hreflangAlternates(`/collections/${product.slug}`),
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
          <ProductGallery images={product.images} alt={product.name[locale]} />
        </div>

        <div>
          <h1 className="font-heading text-3xl">{product.name[locale]}</h1>
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
            <p className="text-2xl font-medium">{formatPrice(product.price, locale)}</p>
            {product.originalPrice && (
              <p className="text-sm text-black/40 line-through">{formatPrice(product.originalPrice, locale)}</p>
            )}
          </div>
          {product.krwReferencePrice && locale !== "ko" && (
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

      {product.activeHighlights && product.activeHighlights.length > 0 && (
        <div className="mt-20 overflow-hidden rounded-3xl bg-white">
          <div className="h-1 bg-gradient-to-r from-gold-dark via-gold-light to-gold" />
          <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-5 lg:gap-14">
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.product.infoTitle}</p>
              <h2 className="mt-3 font-heading text-3xl leading-tight">{product.name[locale]}</h2>
              {product.description && (
                <p className="mt-5 leading-relaxed text-black/70">{product.description[locale]}</p>
              )}
              {product.details && product.details.length > 0 && (
                <ul className="mt-8 space-y-3 border-t border-black/5 pt-6">
                  {product.details.map((item, index) => (
                    <li key={index} className="flex gap-3 text-sm text-black/70">
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-gold-dark" />
                      <span>{item[locale]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-widest text-black/50">{dict.product.highlightActivesTitle}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {product.activeHighlights.map((active, index) => (
                  <div key={active.name} className="rounded-2xl border border-black/5 bg-ivory p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-heading text-xl">{active.name}</h3>
                      <span className="font-heading text-sm text-gold-dark">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="mt-3 h-px w-10 bg-gold-dark/60" />
                    <p className="mt-3 text-sm leading-relaxed text-black/65">{active.description[locale]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {product.benefits && product.benefits.length > 0 && (
        <div className="mt-20">
          <div className="text-center">
            <h2 className="font-heading text-3xl">{dict.product.benefitsTitle}</h2>
            <div className="mx-auto mt-4 h-px w-16 bg-gold-dark" />
          </div>
          <div className={`mt-10 grid gap-6 ${mdGridCols[product.benefits.length] ?? "md:grid-cols-3"}`}>
            {product.benefits.map((item, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <div key={index} className="rounded-2xl border border-black/5 bg-white p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold-light to-gold">
                    <Icon className="h-6 w-6 text-black" />
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-black/70">{item[locale]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!product.hideRoutine && routineProducts.length > 1 && (
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
                <p className="mt-2 text-sm text-black/60">{formatPrice(step.price, locale)}</p>
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
                {dict.product.bundleCta} {formatPrice(bundle.bundlePrice, locale)}
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
        <div className="mt-20 rounded-3xl bg-gold-light/20 p-6 md:p-10">
          <h2 className="text-center font-heading text-3xl">{dict.product.tabs.usage}</h2>
          <ol
            className="relative mt-10 grid gap-8 md:grid-cols-[repeat(var(--steps),minmax(0,1fr))] md:gap-6"
            style={{ ["--steps" as string]: product.usageSteps.length }}
          >
            <span
              aria-hidden
              className="absolute left-[calc(50%/var(--steps))] right-[calc(50%/var(--steps))] top-6 hidden h-px bg-gold-dark/40 md:block"
            />
            {product.usageSteps.map((step, index) => (
              <li key={index} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-dark bg-ivory font-heading text-lg text-gold-dark">
                  {index + 1}
                </span>
                <p className="pt-3 text-sm leading-relaxed text-black/70 md:pt-0">{step[locale]}</p>
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
