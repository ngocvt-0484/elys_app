import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.why.title, description: dict.why.intro };
}

export default function WhyElysidermPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.why.title}</h1>
      <p className="mt-4 text-black/70">{dict.why.intro}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {dict.why.items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-2 text-sm text-black/70">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
