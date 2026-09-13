import { ActionLink } from "../common/ActionLink";

export function ContactSection({ translations }) {
  return (
    <section className="cta" id="contact">
      <div className="container">
        <div>
          <p className="eyebrow">{translations.eyebrow}</p>
          <h2>{translations.title}</h2>
        </div>
        <div>
          <p>{translations.copy}</p>
          <ActionLink className="lime-button" to="contact">
            {translations.action}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
