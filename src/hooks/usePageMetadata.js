import { useEffect } from "react";

export function usePageMetadata(locale, title, description) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [locale, title, description]);
}
