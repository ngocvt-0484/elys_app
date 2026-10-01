"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE } from "@/types/i18n";

export default function RootRedirectPage() {
  useEffect(() => {
    window.location.replace(`/${DEFAULT_LOCALE}`);
  }, []);

  return null;
}
