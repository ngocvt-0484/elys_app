import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import {
  DiamondIcon,
  DropletIcon,
  FlaskIcon,
  HandHeartIcon,
  HeartIcon,
  HourglassIcon,
  LeafDuoIcon,
  MoleculeIcon,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/icons";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, localizedPath } from "@/lib/locale";
import { getAllProducts, getFeaturedProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

const strengthIcons = [MoleculeIcon, SparkleIcon, HeartIcon];
const ingredientIcons = [ShieldIcon, DropletIcon, SparkleIcon, LeafDuoIcon];
const whyIcons = [FlaskIcon, DiamondIcon, HourglassIcon, HandHeartIcon];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.meta.defaultTitle, description: dict.meta.defaultDescription };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const featuredProducts = getFeaturedProducts();
  const allProducts = getAllProducts();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.hero.tag}</p>
        <h1 className="mt-3 font-heading text-4xl md:text-5xl">
          {dict.home.hero.titleLine1}{" "}
          <em className="not-italic text-gold-dark">{dict.home.hero.titleLine2Emphasis}</em>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-black/70">{dict.home.hero.description}</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={localizedPath(locale, "/collections")}
            className="rounded-full bg-black px-8 py-3 text-sm font-medium text-ivory"
          >
            {dict.home.hero.ctaPrimary}
          </Link>
          <Link
            href={localizedPath(locale, "/contact")}
            className="rounded-full border border-black px-8 py-3 text-sm font-medium"
          >
            {dict.home.hero.ctaSecondary}
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-black/60">
          {dict.home.hero.trustBadges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-xs uppercase tracking-widest text-gold-dark">{dict.home.strengths.tag}</p>
        <h2 className="mt-3 text-center font-heading text-3xl">{dict.home.strengths.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-black/70">{dict.home.strengths.description}</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {dict.home.strengths.items.map((item, index) => {
            const Icon = strengthIcons[index % strengthIcons.length];
            return (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/5">
                    <Icon className="h-5 w-5 text-black" />
                  </span>
                  <span className="font-heading text-2xl text-black/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-black/70">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.products.tag}</p>
            <h2 className="mt-3 font-heading text-3xl">{dict.home.products.title}</h2>
            <p className="mt-3 max-w-xl text-sm text-black/70">{dict.home.products.description}</p>
          </div>
          <Link href={localizedPath(locale, "/collections")} className="text-sm font-medium underline">
            {dict.home.products.viewAll}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-stretch">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <img
                src="/images/home/spotlight-texture.jpg"
                alt={dict.home.spotlight.heroIngredient.name}
                width={700}
                height={875}
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
              <div className="rounded-2xl border border-black/5 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-black/50">
                  {dict.home.spotlight.spfBadgeTag}
                </p>
                <p className="mt-1 font-heading text-lg">{dict.home.spotlight.spfBadgeTitle}</p>
                <p className="mt-1 text-sm text-black/70">{dict.home.spotlight.spfBadgeDescription}</p>
              </div>
            </div>
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl bg-black p-5 text-ivory">
                <p className="text-xs uppercase tracking-wide text-gold">
                  {dict.home.spotlight.heroIngredient.tag}
                </p>
                <p className="mt-2 font-heading text-xl">{dict.home.spotlight.heroIngredient.name}</p>
                <p className="mt-2 text-sm text-ivory/70">{dict.home.spotlight.heroIngredient.description}</p>
              </div>
              <img
                src="/images/home/spotlight-lifestyle.jpg"
                alt={dict.home.spotlight.title}
                width={700}
                height={1020}
                className="w-full flex-1 rounded-2xl object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.spotlight.tag}</p>
            <h2 className="mt-3 font-heading text-3xl">{dict.home.spotlight.title}</h2>
            <p className="mt-3 text-sm text-black/70">{dict.home.spotlight.description}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {dict.home.spotlight.ingredients.map((ingredient, index) => {
                const Icon = ingredientIcons[index % ingredientIcons.length];
                return (
                  <div key={ingredient.name} className="rounded-2xl border border-black/5 bg-white p-4">
                    <p className="flex items-center gap-2 font-medium">
                      <Icon className="h-5 w-5 shrink-0 text-gold-dark" />
                      {ingredient.name}
                    </p>
                    <p className="mt-1 text-sm text-black/70">{ingredient.description}</p>
                  </div>
                );
              })}
            </div>
            <Link
              href={localizedPath(locale, "/contact")}
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline"
            >
              {dict.home.spotlight.cta} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.home.why.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-black/70">{dict.home.why.description}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.why.items.map((item, index) => {
            const Icon = whyIcons[index % whyIcons.length];
            return (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.03]">
                  <Icon className="h-5 w-5 text-gold-dark" />
                </span>
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-black/70">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-black py-16 text-ivory">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gold">{dict.home.ctaBanner.tag}</p>
          <h2 className="mt-3 font-heading text-3xl">{dict.home.ctaBanner.title}</h2>
          <p className="mt-4 text-sm text-ivory/80">{dict.home.ctaBanner.description}</p>
          <Link
            href={localizedPath(locale, "/collections")}
            className="mt-8 inline-block rounded-full bg-gold px-8 py-3 text-sm font-medium text-black"
          >
            {dict.home.ctaBanner.button}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-xs uppercase tracking-widest text-gold-dark">
          {dict.home.testimonials.tag}
        </p>
        <h2 className="mt-3 text-center font-heading text-3xl">{dict.home.testimonials.title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dict.home.testimonials.items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-black/5 bg-white p-6">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-4 text-sm text-black/70">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-medium text-gold-dark">
                  {getInitials(item.name)}
                </span>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-black/50">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="lead-form" className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.home.leadForm.title}</h2>
        <p className="mt-3 text-center text-sm text-black/70">{dict.home.leadForm.description}</p>
        <ul className="mt-6 space-y-2 text-sm text-black/70">
          {dict.home.leadForm.bullets.map((bullet) => (
            <li key={bullet}>✓ {bullet}</li>
          ))}
        </ul>
        <div className="mt-8">
          <LeadForm locale={locale} dict={dict} source="homepage" products={allProducts} />
        </div>
      </section>
    </>
  );
}
