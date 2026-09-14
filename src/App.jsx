import { Route, Routes, useLocation } from "react-router-dom";
import { CookieConsent } from "./components/common/CookieConsent";
import { AiIntegrationPage } from "./components/ai/AiIntegrationPage";
import { ServicePage } from "./components/services/ServicePage";
import { HeroSection } from "./components/home/HeroSection";
import { ServicesSection } from "./components/home/ServicesSection";
import { WhyGauasSection } from "./components/home/WhyGauasSection";
import { StatsSection } from "./components/home/StatsSection";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { LegalPage } from "./components/privacy/LegalPage";
import { SelectedWork } from "./components/common/SelectedWork";
import { FinalCta } from "./components/common/FinalCta";
import { WorkPage } from "./components/work/WorkPage";
import { AboutPage } from "./components/about/AboutPage";
import { NotFoundPage } from "./components/common/NotFoundPage";
import { SupportPage } from "./components/common/SupportPage";
import en from "./i18n/en.json";
import { ContactModalProvider } from "./components/contact/ContactModal";
import { usePageMetadata } from "./hooks/usePageMetadata";
import { useRevealAnimations } from "./hooks/useRevealAnimations";
import { useScrollToTopOnNavigation } from "./hooks/useScrollToTopOnNavigation";
import { servicePages } from "./data/content";
import { PAGE_METADATA } from "./config/metadata";

function HomePage() {
  return <><a className="skip" href="#main">Skip to content</a><Header /><main id="main"><HeroSection translations={en.hero} /><ServicesSection /><SelectedWork /><WhyGauasSection /><StatsSection /><FinalCta /></main><Footer /></>;
}

export default function App() {
  const { pathname } = useLocation();
  const knownPath = pathname === "/privacy-policy" ? "/privacy" : pathname;
  const pageMeta = PAGE_METADATA[knownPath] || { title: "Page Not Found | GAUAS", description: "The page you requested could not be found." };
  usePageMetadata({ ...pageMeta, pathname: knownPath, robots: PAGE_METADATA[knownPath] ? undefined : "noindex,follow" });
  useRevealAnimations(pathname);
  useScrollToTopOnNavigation();

  return <><ContactModalProvider translations={en}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/work" element={<WorkPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/website" element={<ServicePage service={servicePages.website} />} />
    <Route path="/mobile-application" element={<ServicePage service={servicePages.mobile} />} />
    <Route path="/tools" element={<ServicePage service={servicePages.tools} />} />
    <Route path="/ai-integration" element={<AiIntegrationPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/privacy" element={<LegalPage policyKey="privacy" />} />
    <Route path="/privacy-policy" element={<LegalPage policyKey="privacy" />} />
    <Route path="/terms" element={<LegalPage policyKey="terms" />} />
    <Route path="/cookies" element={<LegalPage policyKey="cookies" />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></ContactModalProvider><CookieConsent /></>;
}
