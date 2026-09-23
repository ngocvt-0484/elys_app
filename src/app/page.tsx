"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALES } from "@/types/i18n";

export default function RootRedirectPage() {
  useEffect(() => {
    const browserLanguages = navigator.languages ?? [navigator.language];
    const match = browserLanguages
      .map((lang) => lang.slice(0, 2))
      .find((lang) => (LOCALES as readonly string[]).includes(lang));

    window.location.replace(`/${match ?? DEFAULT_LOCALE}`);
  }, []);

  return null;
}
