import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NAVIGATION_TARGETS, SERVICE_ROUTES } from "../../config/site";
import { useSectionNavigation } from "../../hooks/useSectionNavigation";
import { BrandButton } from "../common/BrandButton";
import { useContactModal } from "../contact/ContactModal";

export function Header({ translations, solid = false }) {
  const routeNavigate = useNavigate();
  const navigateToSection = useSectionNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { openContactModal } = useContactModal();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsServicesOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    let animationFrame;
    const updateHeader = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const heroHeight = document.querySelector(".hero")?.offsetHeight ?? 0;
        const headerHeight = document.querySelector(".header")?.offsetHeight ?? 0;
        setIsScrolled(scrollY + headerHeight >= heroHeight);
      });
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  const goToSection = (sectionId) => {
    navigateToSection(sectionId);
    setIsOpen(false);
    setIsServicesOpen(false);
  };

  const serviceItems = translations.services.items.slice(0, 4);
  const serviceIndex = translations.nav.length - 1;
  const openService = (index) => {
    routeNavigate(SERVICE_ROUTES[index]);
    setIsOpen(false);
    setIsServicesOpen(false);
  };

  const className = [
    "header",
    isOpen && "open",
    isScrolled && "scrolled",
    solid && "solid",
  ].filter(Boolean).join(" ");

  return (
    <header className={className}>
      <div className="header-inner">
        <BrandButton label={translations.nav[0]} onClick={() => goToSection("top")} light={!solid && (isScrolled || isOpen)} />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {translations.nav.map((label, index) => {
            if (index !== serviceIndex) {
              return <button type="button" onClick={() => goToSection(NAVIGATION_TARGETS[index])} key={NAVIGATION_TARGETS[index]}>{label}</button>;
            }

            return (
              <div className="service-dropdown" key={NAVIGATION_TARGETS[index]} onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
                <button className="service-trigger" type="button" aria-expanded={isServicesOpen} aria-controls="desktop-services" onClick={() => setIsServicesOpen(true)}>
                  {label}<ChevronDown size={13} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <div className={`service-dropdown-panel ${isServicesOpen ? "visible" : ""}`} id="desktop-services">
                  {serviceItems.map(([title, description], itemIndex) => <button type="button" onClick={() => openService(itemIndex)} key={title}><strong>{title}</strong><span>{description}</span></button>)}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="header-actions">
          <button
            className="header-contact"
            type="button"
            onClick={openContactModal}
          >
            {translations.contact}
          </button>
          <button className="lime-button" type="button" onClick={openContactModal}>{translations.consult}</button>
        </div>
        <button
          className="menu-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
      <nav className="mobile-nav" id="mobile-nav">
        {translations.nav.map((label, index) => {
          if (index !== serviceIndex) {
            return <button type="button" key={NAVIGATION_TARGETS[index]} onClick={() => goToSection(NAVIGATION_TARGETS[index])}>{label}</button>;
          }

          return <div className={`mobile-service-menu ${isServicesOpen ? "visible" : ""}`} key={NAVIGATION_TARGETS[index]}>
            <button className="mobile-service-trigger" type="button" aria-expanded={isServicesOpen} onClick={() => setIsServicesOpen((current) => !current)}>{label}<ChevronDown size={15} aria-hidden="true" /></button>
            <div className="mobile-service-panel">{serviceItems.map(([title], itemIndex) => <button type="button" onClick={() => openService(itemIndex)} key={title}>{title}</button>)}</div>
          </div>;
        })}
        <button type="button" onClick={openContactModal}>
          {translations.contact}
        </button>
        <button
          className="lime-button"
          type="button"
          onClick={openContactModal}
        >
          {translations.consult}
        </button>
      </nav>
    </header>
  );
}
