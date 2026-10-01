import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircleIcon,
  FlaskIcon,
  GlobeIcon,
  LightbulbIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StarOutlineIcon,
} from "@/components/icons";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, hreflangAlternates, localizedPath } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

const valueIcons = [FlaskIcon, CheckCircleIcon, LightbulbIcon, SparkleIcon, GlobeIcon];

const brandKeywords: Record<Locale, string[]> = {
  vi: ["Elysiderm", "Eirlys'"],
  en: ["Elysiderm", "Eirlys'"],
  ko: ["엘리시더미", "Elysiderm", "Eirlys'"],
};

function withBoldKeywords(text: string, keywords: string[]): ReactNode[] {
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  return text.split(pattern).map((part, index) =>
    keywords.includes(part) ? (
      <strong key={index} className="font-semibold text-black">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.about.title, description: dict.about.intro, alternates: hreflangAlternates("/about") };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const keywords = brandKeywords[locale];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs uppercase tracking-widest text-gold-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-dark" />
          {dict.about.title}
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl">{dict.about.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-black/70">{withBoldKeywords(dict.about.intro, ["ELYSIDERM"])}</p>
        <div className="mx-auto mt-6 h-px w-16 bg-black/15" />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light/25">
            <StarOutlineIcon className="h-5 w-5 text-gold-dark" />
          </span>
          <h2 className="mt-4 font-heading text-xl">{dict.about.visionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.vision}</p>
          <div className="mt-6 h-px bg-black/10" />
          <p className="mt-4 text-xs uppercase tracking-widest text-gold-dark">{dict.about.visionCaption}</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light/25">
            <ShieldCheckIcon className="h-5 w-5 text-gold-dark" />
          </span>
          <h2 className="mt-4 font-heading text-xl">{dict.about.missionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.mission}</p>
          <div className="mt-6 h-px bg-black/10" />
          <p className="mt-4 text-xs uppercase tracking-widest text-gold-dark">{dict.about.missionCaption}</p>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.about.valuesTag}</p>
            <h2 className="mt-3 font-heading text-3xl">{dict.about.valuesTitle}</h2>
          </div>
          <p className="hidden text-xs uppercase tracking-widest text-black/40 sm:block">
            {dict.about.valuesCaption}
          </p>
        </div>
        <div className="mt-6 h-px bg-black/10" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {dict.about.values.map((value, index) => {
            const Icon = valueIcons[index % valueIcons.length];
            return (
              <div key={value.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light/25">
                    <Icon className="h-5 w-5 text-gold-dark" />
                  </span>
                  <span className="font-heading text-2xl text-black/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-medium">{value.title}</h3>
                <p className="mt-2 text-sm text-black/70">{value.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-20 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />

      <div className="mt-12 rounded-3xl bg-white p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,380px)_1fr] md:items-start">
          <div className="relative">
            <div className="absolute -bottom-3 -left-3 hidden h-full w-full rounded-2xl border border-gold/40 sm:block" />
            <div className="group relative overflow-hidden rounded-2xl md:rounded-b-none">
              <img
                src="/images/about/snowdrop.jpg"
                alt={dict.about.brandStory.photoCaption.scientific}
                width={896}
                height={1200}
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 md:aspect-auto md:h-[420px]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-4 md:hidden">
                <p className="font-heading italic text-sm text-white">
                  {dict.about.brandStory.photoCaption.scientific}
                </p>
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-wide text-white">
                  {dict.about.brandStory.photoCaption.formula}
                </span>
              </div>
            </div>
            <div className="hidden items-center justify-between rounded-b-2xl bg-gold-light/10 px-5 py-3 md:flex">
              <p className="font-heading italic text-gold-dark">{dict.about.brandStory.photoCaption.scientific}</p>
              <p className="text-xs uppercase tracking-widest text-black/50">
                {dict.about.brandStory.photoCaption.formula}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.about.brandStory.tag}</p>
            <h2 className="mt-3 font-heading text-3xl">
              <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
                {dict.about.brandStory.title}
              </span>
            </h2>
            <p className="mt-2 font-heading text-lg italic text-gold-dark">{dict.about.brandStory.subtitle}</p>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-black/70">
              {dict.about.brandStory.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <blockquote className="my-6 border-l-4 border-gold pl-5 font-heading text-base italic leading-relaxed text-black/80">
              &ldquo;{dict.about.brandStory.quote}&rdquo;
            </blockquote>
            <div className="space-y-4 text-sm leading-relaxed text-black/70">
              {dict.about.brandStory.afterQuoteParagraphs.map((paragraph, index) => (
                <p key={index}>
                  {index === dict.about.brandStory.afterQuoteParagraphs.length - 1
                    ? withBoldKeywords(paragraph, keywords)
                    : paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-gold/30 bg-gradient-to-br from-white to-gold-light/10 p-8 sm:p-12">
        <div className="text-center">
          <span className="font-heading text-6xl leading-none text-gold">&ldquo;</span>
          <p className="-mt-2 text-xs uppercase tracking-widest text-gold-dark">{dict.about.founderLetter.tag}</p>
          <h2 className="mt-3 font-heading text-2xl">{dict.about.founderLetter.title}</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        </div>

        <p className="mt-8 font-heading text-lg italic text-black/80">{dict.about.founderLetter.salutation}</p>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-black/70">
          {dict.about.founderLetter.paragraphs.map((paragraph, index) => (
            <p key={index}>
              {index === dict.about.founderLetter.paragraphs.length - 1
                ? withBoldKeywords(paragraph, keywords)
                : paragraph}
            </p>
          ))}
        </div>

        <blockquote className="my-8 rounded-xl border-l-4 border-gold-dark bg-black/[0.03] p-6 font-heading text-base italic leading-relaxed text-black/80">
          &ldquo;{dict.about.founderLetter.quote}&rdquo;
        </blockquote>

        <p className="text-sm leading-relaxed text-black/70">{dict.about.founderLetter.closing}</p>

        <div className="mt-10 h-px bg-black/10" />

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm italic text-black/60">{dict.about.founderLetter.signOff}</p>
            <p className="mt-2 font-heading text-lg">{dict.about.founderLetter.founderTitle}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-gold-dark">
              {dict.about.founderLetter.founderRole}
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-gold-dark/50 font-heading text-xs text-gold-dark">
            ELYS
          </span>
        </div>
      </div>

      {/* <div className="mt-12 flex flex-col items-center gap-6 rounded-2xl border border-black/5 bg-white/60 p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:p-8 sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-light/25">
            <CheckCircleIcon className="h-5 w-5 text-gold-dark" />
          </span>
          <div>
            <h2 className="font-heading text-xl">{dict.about.standards.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-black/70">{dict.about.standards.description}</p>
          </div>
        </div>
        <Link
          href={localizedPath(locale, "/technology")}
          className="inline-block shrink-0 rounded-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-widest text-ivory"
        >
          {dict.about.standards.cta}
        </Link>
      </div> */}
    </section>
  );
}
