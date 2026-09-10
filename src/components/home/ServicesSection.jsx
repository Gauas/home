import {
  LayoutTemplate,
  Layers3,
  LifeBuoy,
  MousePointerClick,
  UserRound,
  Workflow,
} from "lucide-react";
import { ActionLink } from "../common/ActionLink";

const SERVICE_ICONS = [
  LayoutTemplate,
  MousePointerClick,
  UserRound,
  Workflow,
  Layers3,
  LifeBuoy,
];

export function ServicesSection({ translations, statistics }) {
  return (
    <section className="services" id="solutions">
      <div className="container">
        <div className="services-intro reveal">
          <div>
            <p className="eyebrow dark">{translations.eyebrow}</p>
            <h2>{translations.title}</h2>
          </div>
          <p>{translations.copy}</p>
          <ActionLink to="contact">{translations.all}</ActionLink>
        </div>
        <div className="service-row" id="industries">
          {translations.items.map(([title, copy], index) => {
            const Icon = SERVICE_ICONS[index];
            return (
              <article key={title}>
                <span><Icon size={23} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            );
          })}
        </div>
        <div className="stats" id="about">
          <div className="stats-label">
            <p className="eyebrow dark">{statistics.eyebrow}</p>
            <h2>{statistics.title}</h2>
          </div>
          {statistics.items.map(([value, label]) => (
            <div key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
