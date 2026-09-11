import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/site";

const navigationItems = ["Products", "Infrastructure", "Work", "About", "Docs"];

export function LegalHeader() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const goHome = () => navigate("/");

  return <header className={`privacy-header ${isOpen ? "open" : ""}`}>
    <div className="privacy-header-inner">
      <button className="privacy-brand" type="button" onClick={goHome} aria-label="GAUAS home"><img src="/assets/full_logo.png" alt="GAUAS" /></button>
      <nav className="privacy-desktop-nav" aria-label="Primary navigation">{navigationItems.map((item) => <button type="button" onClick={goHome} key={item}>{item}</button>)}</nav>
      <div className="privacy-header-actions"><button type="button" aria-label="Search"><Search size={17} strokeWidth={1.6} /></button><a className="privacy-contact" href={`mailto:${CONTACT_EMAIL}`}>Contact</a><button className="privacy-console" type="button" onClick={goHome}>Console <span aria-hidden="true">→</span></button></div>
      <button className="privacy-menu-button" type="button" onClick={() => setIsOpen((current) => !current)} aria-label="Toggle navigation" aria-expanded={isOpen}>{isOpen ? <X /> : <Menu />}</button>
    </div>
    <nav className="privacy-mobile-nav" aria-label="Mobile navigation">{navigationItems.map((item) => <button type="button" onClick={goHome} key={item}>{item}</button>)}<a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></nav>
  </header>;
}
