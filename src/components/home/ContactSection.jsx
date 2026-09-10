import { CONTACT_EMAIL } from "../../config/site";
import { ActionLink } from "../common/ActionLink";

export function ContactSection({ translations }) {
  const emailSubject = encodeURIComponent(translations.action);

  return (
    <section className="cta" id="contact">
      <div className="container">
        <div>
          <p className="eyebrow">{translations.eyebrow}</p>
          <h2>{translations.title}</h2>
        </div>
        <div>
          <p>{translations.copy}</p>
          <ActionLink
            className="lime-button"
            href={`mailto:${CONTACT_EMAIL}?subject=${emailSubject}`}
          >
            {translations.action}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
