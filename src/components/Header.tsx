import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/lib/locale";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const navItems = [
    { href: localizedPath(locale, "/"), label: dict.nav.home },
    { href: localizedPath(locale, "/about"), label: dict.nav.about },
    { href: localizedPath(locale, "/collections"), label: dict.nav.collections },
    { href: localizedPath(locale, "/technology"), label: dict.nav.technology },
    { href: localizedPath(locale, "/why-elysiderm"), label: dict.nav.why },
    { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href={localizedPath(locale, "/")} className="flex shrink-0 items-center gap-2.5">
          <img src="/images/brand/logo-badge.png" alt="" width={240} height={240} className="h-9 w-9" />
          <span className="font-heading text-xl tracking-wide">ELYSIDERM</span>
        </Link>

        <nav className="hidden flex-1 justify-center gap-5 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium hover:text-gold-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={localizedPath(locale, "/contact")}
            className="whitespace-nowrap rounded-full bg-black px-5 py-2 text-sm font-medium text-ivory hover:bg-gold-dark"
          >
            {dict.header.ctaConsult}
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher locale={locale} />
          <details className="group relative">
            <summary className="list-none rounded-full border border-black/10 px-3 py-2 text-sm">☰</summary>
            <div className="absolute right-0 top-full mt-2 w-64 space-y-4 rounded-2xl border border-black/5 bg-ivory p-5 shadow-lg">
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm font-medium">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href={localizedPath(locale, "/contact")}
                className="block rounded-full bg-black px-5 py-2 text-center text-sm font-medium text-ivory"
              >
                {dict.header.ctaConsult}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
