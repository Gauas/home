import { useEffect, useState } from "react";
import { ContactSection } from "./components/home/ContactSection";
import { GrowthSection } from "./components/home/GrowthSection";
import { HeroSection } from "./components/home/HeroSection";
import { ServicesSection } from "./components/home/ServicesSection";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { detectLocale, messages } from "./i18n";
import { scrollToSection } from "./utils/scrollToSection";

function useBrowserLocale() {
  const [locale, setLocale] = useState(detectLocale);

  useEffect(() => {
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }

    const updateLocale = () => setLocale(detectLocale());
    window.addEventListener("languagechange", updateLocale);
    return () => window.removeEventListener("languagechange", updateLocale);
  }, []);

  return locale;
}

function usePageMetadata(locale, description) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.title = "GAUAS · Modern Application Builder";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [locale, description]);
}

function useRevealAnimations(locale) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [locale]);
}

export default function App() {
  const locale = useBrowserLocale();
  const translations = messages[locale];

  usePageMetadata(locale, translations.hero.copy);
  useRevealAnimations(locale);

  return (
    <>
      <button
        className="skip"
        type="button"
        onClick={() => scrollToSection("main")}
      >
        {translations.skip}
      </button>
      <Header translations={translations} />
      <main id="main">
        <HeroSection translations={translations.hero} />
        <ServicesSection
          translations={translations.services}
          statistics={translations.stats}
        />
        <GrowthSection translations={translations.growth} />
        <ContactSection translations={translations.cta} />
      </main>
      <Footer translations={translations.footer} navigation={translations.nav} />
    </>
  );
}
