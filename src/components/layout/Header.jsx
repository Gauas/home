import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PRIMARY_NAVIGATION, SERVICES } from "../../config/site";
import { GauasLogo } from "../GauasLogo";
import { useContactModal } from "../contact/ContactModal";

export function Header({ solid = false }) {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { openContactModal } = useContactModal();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const closeOnEscape = (event) => event.key === "Escape" && (setIsOpen(false), setIsServicesOpen(false));
    window.addEventListener("keydown", closeOnEscape);
    return () => { window.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 32);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => { setIsOpen(false); setIsServicesOpen(false); }, [pathname]);

  const closeMenu = () => { setIsOpen(false); setIsServicesOpen(false); };
  const className = ["header", isOpen && "open", isScrolled && "scrolled", solid && "solid"].filter(Boolean).join(" ");

  return (
    <header className={className}>
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="GAUAS home"><GauasLogo light={!solid && (isScrolled || isOpen)} /></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {PRIMARY_NAVIGATION.map((item) => item.dropdown ? (
            <div className="service-dropdown" key={item.label} onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)} onFocus={() => setIsServicesOpen(true)} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setIsServicesOpen(false)}>
              <button className="service-trigger" type="button" aria-expanded={isServicesOpen} aria-controls="desktop-services" onClick={() => setIsServicesOpen((current) => !current)}>{item.label}<ChevronDown size={13} aria-hidden="true" /></button>
              <div className={`service-dropdown-panel ${isServicesOpen ? "visible" : ""}`} id="desktop-services">
                {SERVICES.map((service) => <Link to={service.href} key={service.href}><strong>{service.label}</strong><span>{service.description}</span></Link>)}
              </div>
            </div>
          ) : <NavLink to={item.href} key={item.href} end={item.href === "/"}>{item.label}</NavLink>)}
        </nav>
        <div className="header-actions"><button className="header-contact" type="button" onClick={openContactModal}>Contact</button><button className="lime-button" type="button" onClick={openContactModal}>Start a project</button></div>
        <button className="menu-button" type="button" aria-expanded={isOpen} aria-controls="mobile-nav" aria-label={isOpen ? "Close menu" : "Open menu"} onClick={() => setIsOpen((current) => !current)}>{isOpen ? <X /> : <Menu />}</button>
      </div>
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/work" onClick={closeMenu}>Work</Link>
        <div className={`mobile-service-menu ${isServicesOpen ? "visible" : ""}`}>
          <button className="mobile-service-trigger" type="button" aria-expanded={isServicesOpen} onClick={() => setIsServicesOpen((current) => !current)}>Services<ChevronDown size={15} aria-hidden="true" /></button>
          <div className="mobile-service-panel">{SERVICES.map((service) => <Link to={service.href} onClick={closeMenu} key={service.href}>{service.label}</Link>)}</div>
        </div>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <button className="lime-button" type="button" onClick={(event) => { closeMenu(); openContactModal(event); }}>Start a project</button>
      </nav>
    </header>
  );
}
