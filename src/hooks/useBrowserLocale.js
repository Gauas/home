import { useEffect, useState } from "react";
import { detectLocale } from "../i18n";

export function useBrowserLocale() {
  const [locale, setLocale] = useState(detectLocale);

  useEffect(() => {
    const updateLocale = () => setLocale(detectLocale());
    window.addEventListener("languagechange", updateLocale);
    return () => window.removeEventListener("languagechange", updateLocale);
  }, []);

  return locale;
}
