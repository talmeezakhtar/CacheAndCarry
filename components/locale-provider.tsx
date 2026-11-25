"use client";

import { createContext, useContext, useMemo } from "react";
import { i18n, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

/** Set once per root layout, so client components read the page's language without props. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** t(), money() and path() for the current page's language. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(() => i18n(locale), [locale]);
}
