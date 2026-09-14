import { Link } from "react-router-dom";
import { CONTACT_EMAIL, SERVICES } from "../../config/site";
import { GauasLogo } from "../GauasLogo";
import { useContactModal } from "../contact/ContactModal";

export function Footer() {
  const { openContactModal } = useContactModal();
  return (
    <footer>
      <div className="container footer-shell">
        <div className="footer-grid editorial-footer">
          <div className="footer-intro"><GauasLogo /><p>Digital products built for real businesses.</p><span>1158 Truong Chinh, An Khe,<br />Da Nang, Vietnam.</span></div>
          <nav aria-label="Company"><strong>GAUAS</strong><Link to="/work">Work</Link><Link to="/about">About</Link><button type="button" onClick={openContactModal}>Contact</button></nav>
          <nav aria-label="Services"><strong>SERVICES</strong>{SERVICES.map((service) => <Link to={service.href} key={service.href}>{service.label}</Link>)}</nav>
          <nav aria-label="Resources"><strong>RESOURCES</strong><Link to="/work">Work archive</Link><Link to="/support">Support</Link></nav>
          <nav aria-label="Legal"><strong>LEGAL</strong><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/cookies">Cookie Policy</Link></nav>
        </div>
        <div className="footer-bottom"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><p>© {new Date().getFullYear()} GAUAS. All rights reserved.</p></div>
        <img className="footer-wordmark" src="/assets/gauas-footer-wordmark.png" width="2172" height="724" loading="lazy" decoding="async" alt="" aria-hidden="true" />
      </div>
    </footer>
  );
}
