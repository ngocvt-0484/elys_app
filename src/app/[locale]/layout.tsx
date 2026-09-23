import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { rosario, montserrat } from "@/lib/fonts";
import { LOCALES, type Locale } from "@/types/i18n";
import { isLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HtmlLangSetter from "@/components/HtmlLangSetter";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);

  return {
    metadataBase: new URL("https://elysiderm.vn"),
    title: { default: dict.meta.defaultTitle, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    alternates: {
      languages: { vi: "/vi", en: "/en", ko: "/ko", "x-default": "/vi" },
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <div className={`${rosario.variable} ${montserrat.variable} font-body`}>
      <HtmlLangSetter locale={locale} />
      <Header locale={locale} dict={dict} />
      <main>{children}</main>
      <Footer locale={locale} dict={dict} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: dict.meta.siteName,
            url: "https://elysiderm.vn",
            description: dict.meta.defaultDescription,
          }),
        }}
      />
    </div>
  );
}
