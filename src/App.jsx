import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ContactSection } from "./components/home/ContactSection";
import { CookieConsent } from "./components/common/CookieConsent";
import { AiIntegrationPage } from "./components/ai/AiIntegrationPage";
import { ServicePage } from "./components/services/ServicePage";
import { GrowthSection } from "./components/home/GrowthSection";
import { HeroSection } from "./components/home/HeroSection";
import { ServicesSection } from "./components/home/ServicesSection";
import { WhyGauasSection } from "./components/home/WhyGauasSection";
import { StatsSection } from "./components/home/StatsSection";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { LegalPage } from "./components/privacy/LegalPage";
import { legalPolicies } from "./components/privacy/legalPolicies";
import { messages } from "./i18n";
import { scrollToSection } from "./utils/scrollToSection";
import { ContactModalProvider } from "./components/contact/ContactModal";
import { useBrowserLocale } from "./hooks/useBrowserLocale";
import { usePageMetadata } from "./hooks/usePageMetadata";
import { useRevealAnimations } from "./hooks/useRevealAnimations";
import { useScrollToTopOnNavigation } from "./hooks/useScrollToTopOnNavigation";

function HomePage({ translations }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sectionId = location.state?.scrollTarget;
    if (!sectionId) return;

    requestAnimationFrame(() => {
      scrollToSection(sectionId);
      navigate("/", { replace: true, state: null });
    });
  }, [location.state, navigate]);

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
        <ServicesSection translations={translations.services} />
        <WhyGauasSection />
        <StatsSection statistics={translations.stats} />
        <GrowthSection translations={translations.growth} />
        <ContactSection translations={translations.cta} />
      </main>
      <Footer translations={translations.footer} navigation={translations.nav} />
    </>
  );
}

export default function App() {
  const locale = useBrowserLocale();
  const translations = messages[locale];
  const { pathname } = useLocation();
  const policyKey = pathname === "/terms"
    ? "terms"
    : pathname === "/cookies"
      ? "cookies"
      : pathname === "/privacy" || pathname === "/privacy-policy"
        ? "privacy"
        : null;

  usePageMetadata(
    locale,
    policyKey ? `${legalPolicies[policyKey].title} · Gauas` : "Gauas · Modern Application Builder",
    policyKey
      ? legalPolicies[policyKey].description
      : translations.hero.copy,
  );
  useRevealAnimations(locale);
  useScrollToTopOnNavigation();

  return (
    <>
      <ContactModalProvider translations={translations}>
        <Routes>
          <Route path="/privacy" element={<LegalPage policyKey="privacy" />} />
          <Route path="/privacy-policy" element={<LegalPage policyKey="privacy" />} />
          <Route path="/terms" element={<LegalPage policyKey="terms" />} />
          <Route path="/cookies" element={<LegalPage policyKey="cookies" />} />
          <Route path="/ai-integration" element={<AiIntegrationPage translations={translations} />} />
          <Route path="/website" element={<ServicePage translations={translations} service={translations.services.items[0]} />} />
          <Route path="/mobile-application" element={<ServicePage translations={translations} service={translations.services.items[1]} />} />
          <Route path="/tools" element={<ServicePage translations={translations} service={translations.services.items[3]} />} />
          <Route path="/support" element={<ServicePage translations={translations} service={translations.services.items[4]} />} />
          <Route path="*" element={<HomePage translations={translations} />} />
        </Routes>
      </ContactModalProvider>
      <CookieConsent />
    </>
  );
}
