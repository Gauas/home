import { CONTACT_EMAIL, NAVIGATION_TARGETS } from "../../config/site";
import { scrollToSection } from "../../utils/scrollToSection";
import { BrandButton } from "../common/BrandButton";

export function Footer({ translations, navigation }) {
  return (
    <footer id="docs">
      <div className="container footer-grid">
        <div>
          <BrandButton label={navigation[0]} />
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
        <div>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href="tel:+84367641617">+84 367 641 617</a>
        </div>
        <div>
          <p>{translations.rights}</p>
          <span>{translations.mantra}</span>
        </div>
      </div>
    </footer>
  );
}
