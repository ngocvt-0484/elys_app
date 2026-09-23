import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/lib/locale";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg">ELYSIDERM</p>
          <p className="mt-2 text-sm text-black/70">{dict.footer.description}</p>
        </div>
        <div>
          <p className="font-medium">{dict.footer.exploreTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li><Link href={localizedPath(locale, "/about")}>{dict.nav.about}</Link></li>
            <li><Link href={localizedPath(locale, "/collections")}>{dict.nav.collections}</Link></li>
            <li><Link href={localizedPath(locale, "/technology")}>{dict.nav.technology}</Link></li>
            <li><Link href={localizedPath(locale, "/why-elysiderm")}>{dict.nav.why}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{dict.footer.policyTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li><Link href={localizedPath(locale, "/privacy")}>{dict.footer.privacy}</Link></li>
            <li><Link href={localizedPath(locale, "/returns")}>{dict.footer.returns}</Link></li>
            <li><Link href={localizedPath(locale, "/terms")}>{dict.footer.terms}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{dict.footer.careTitle}</p>
          <p className="mt-2 text-sm text-black/70">{dict.footer.addressValue}</p>
          <p className="mt-1 text-sm text-black/70">{dict.footer.hotlineLabel}: {dict.footer.hotlineValue}</p>
          <p className="text-sm text-black/70">{dict.footer.emailLabel}: {dict.footer.emailValue}</p>
          <p className="text-sm text-black/70">{dict.footer.hoursValue}</p>
        </div>
      </div>
      <p className="border-t border-black/5 py-4 text-center text-xs text-black/50">
        {dict.footer.copyright.replace("{year}", String(year))}
      </p>
    </footer>
  );
}
