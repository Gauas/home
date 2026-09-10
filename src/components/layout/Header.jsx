import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAVIGATION_TARGETS } from "../../config/site";
import { scrollToSection } from "../../utils/scrollToSection";
import { ActionLink } from "../common/ActionLink";
import { BrandButton } from "../common/BrandButton";

export function Header({ translations }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
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
      animationFrame = requestAnimationFrame(() => setIsScrolled(scrollY > 24));
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  const navigate = (sectionId) => {
    scrollToSection(sectionId);
    setIsOpen(false);
  };

  const className = [
    "header",
    isOpen && "open",
    isScrolled && "scrolled",
  ].filter(Boolean).join(" ");

  return (
    <header className={className}>
      <div className="header-inner">
        <BrandButton label={translations.nav[0]} />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {translations.nav.map((label, index) => (
            <button
              type="button"
              onClick={() => scrollToSection(NAVIGATION_TARGETS[index])}
              key={NAVIGATION_TARGETS[index]}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="header-contact"
            type="button"
            onClick={() => scrollToSection("contact")}
          >
            {translations.contact}
          </button>
          <ActionLink className="lime-button" to="contact">
            {translations.consult}
          </ActionLink>
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
        {translations.nav.map((label, index) => (
          <button
            type="button"
            key={NAVIGATION_TARGETS[index]}
            onClick={() => navigate(NAVIGATION_TARGETS[index])}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={() => navigate("contact")}>
          {translations.contact}
        </button>
        <button
          className="lime-button"
          type="button"
          onClick={() => navigate("contact")}
        >
          {translations.consult}
        </button>
      </nav>
    </header>
  );
}
