"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/types/i18n";
import { replaceLocaleInPath } from "@/lib/locale";

const LABELS: Record<Locale, string> = { vi: "VN", en: "EN", ko: "KO" };

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 p-1 text-xs">
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={replaceLocaleInPath(pathname, code)}
          className={`rounded-full px-2 py-1 ${code === locale ? "bg-black text-ivory" : "text-black/60"}`}
        >
          {LABELS[code]}
        </Link>
      ))}
    </div>
  );
}
