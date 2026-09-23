import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.about.title, description: dict.about.intro };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.about.title}</h1>
      <p className="mt-4 text-black/70">{dict.about.intro}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl">{dict.about.visionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.vision}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl">{dict.about.missionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.mission}</p>
        </div>
      </div>

      <h2 className="mt-12 font-heading text-2xl">{dict.about.valuesTitle}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {dict.about.values.map((value) => (
          <div key={value.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{value.title}</h3>
            <p className="mt-2 text-sm text-black/70">{value.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
