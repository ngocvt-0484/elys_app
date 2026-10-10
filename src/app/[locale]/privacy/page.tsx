import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPage from "@/components/PolicyPage";
import PolicyDocument, { type PolicyContent } from "@/components/PolicyDocument";
import privacyPolicy from "@/data/privacy-policy.json";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, hreflangAlternates } from "@/lib/locale";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDictionary(params.locale).policies.privacyTitle, alternates: hreflangAlternates("/privacy") };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = getDictionary(params.locale);
  return (
    <PolicyPage title={dict.policies.privacyTitle}>
      <PolicyDocument content={privacyPolicy as PolicyContent} locale={params.locale} />
    </PolicyPage>
  );
}
