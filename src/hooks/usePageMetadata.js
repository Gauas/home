import { useEffect } from "react";
import { SITE_URL } from "../config/site";

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export function usePageMetadata({ title, description, pathname, robots = "index,follow,max-image-preview:large" }) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
    document.documentElement.lang = "en";
    document.documentElement.dataset.locale = "en";
    document.title = title;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: robots });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_US" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
  }, [title, description, pathname, robots]);
}
