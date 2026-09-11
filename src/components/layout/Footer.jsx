import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_LABEL,
  NAVIGATION_TARGETS,
} from "../../config/site";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "../../utils/scrollToSection";

export function Footer({ translations, navigation }) {
  const navigate = useNavigate();
  const legalRoutes = ["/privacy", "/terms", "/cookies"];

  return (
    <footer id="docs">
      <div className="container footer-shell">
        <div className="footer-grid">
          <div className="footer-intro">
            <p>{translations.descriptor}</p>
          </div>
          <nav aria-label="Footer navigation">
            {navigation.map((label, index) => (
              <button
                type="button"
                onClick={() => scrollToSection(NAVIGATION_TARGETS[index])}
                key={NAVIGATION_TARGETS[index]}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="footer-contact">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE_LABEL}</a>
          </div>
          <div className="footer-legal">
            <p>{translations.rights}</p>
            <span>{translations.mantra}</span>
            <nav className="footer-policy-links" aria-label="Legal navigation">
              {translations.legal.map((label, index) => (
                <button type="button" onClick={() => navigate(legalRoutes[index])} key={legalRoutes[index]}>{label}</button>
              ))}
            </nav>
          </div>
        </div>
        <img className="footer-wordmark" src="/assets/footer_logo.png" alt="GAUAS" />
      </div>
    </footer>
  );
}
