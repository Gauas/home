import { ActionLink } from "../common/ActionLink";

export function GrowthSection({ translations }) {
  return (
    <section className="growth" id="projects">
      <div className="growth-image">
        <img src="/assets/growth-panels.webp" alt={translations.alt} />
      </div>
      <div className="growth-copy reveal">
        <p className="eyebrow dark">{translations.eyebrow}</p>
        <h2>{translations.title}</h2>
        <p>{translations.copy}</p>
        <ActionLink className="dark-button" to="contact">
          {translations.action}
        </ActionLink>
      </div>
    </section>
  );
}
