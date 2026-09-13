import { ActionLink } from "../common/ActionLink";
import { InteractiveServiceCard } from "./InteractiveServiceCard";
import { SERVICE_ROUTES } from "../../config/site";

export function ServicesSection({ translations }) {
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
          {translations.items.map(([title, copy], index) => (
            <InteractiveServiceCard
              title={title}
              copy={copy}
              href={SERVICE_ROUTES[index]}
              index={index}
              key={title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
