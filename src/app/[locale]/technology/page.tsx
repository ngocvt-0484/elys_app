import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.technology.title, description: dict.technology.intro };
}

export default function TechnologyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.technology.title}</h1>
      <p className="mt-4 text-black/70">{dict.technology.intro}</p>

      <h2 className="mt-10 font-heading text-2xl">{dict.technology.pillarsTitle}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {dict.technology.pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{pillar.title}</h3>
            <p className="mt-2 text-sm text-black/70">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
