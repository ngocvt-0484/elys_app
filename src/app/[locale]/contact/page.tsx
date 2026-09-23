import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import { getAllProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.contact.title, description: dict.contact.description };
}

export default function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.contact.title}</h1>
      <p className="mt-4 text-black/70">{dict.contact.description}</p>
      <div className="mt-8">
        <LeadForm locale={locale} dict={dict} source="contact-page" products={products} />
      </div>
    </section>
  );
}
