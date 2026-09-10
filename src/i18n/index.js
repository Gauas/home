import en from "./en.json";
import ja from "./jp.json";
import vi from "./vn.json";

export function detectLocale() {
  if (typeof navigator === "undefined") return "en";

  const browserLocale = (
    navigator.languages?.[0] ||
    navigator.language ||
    "en"
  ).toLowerCase();

  if (browserLocale.startsWith("ja")) return "ja";
  if (browserLocale.startsWith("vi")) return "vi";
  return "en";
}

export const messages = { en, ja, vi };
