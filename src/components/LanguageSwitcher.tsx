"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types/i18n";
import { replaceLocaleInPath } from "@/lib/locale";

const LABELS: Record<Locale, string> = { vi: "VN", en: "EN", ko: "KO" };
const DISPLAY_ORDER: Locale[] = ["en", "ko", "vi"];

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 p-1 text-xs">
      {DISPLAY_ORDER.map((code) => (
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
