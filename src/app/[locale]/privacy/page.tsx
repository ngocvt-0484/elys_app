import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPage from "@/components/PolicyPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDictionary(params.locale).policies.privacyTitle };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = getDictionary(params.locale);
  return <PolicyPage title={dict.policies.privacyTitle} body={dict.policies.privacyBody} />;
}
