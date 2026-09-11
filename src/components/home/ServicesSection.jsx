import { ActionLink } from "../common/ActionLink";
import { CountUpValue } from "../common/CountUpValue";

const SERVICE_ASSETS = [
  "/assets/emoji/website.svg",
  "/assets/emoji/mobile.svg",
  "/assets/emoji/ai.svg",
  "/assets/emoji/tool.svg",
  "/assets/emoji/support.svg",
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
            return (
              <article key={title}>
                <span className="service-icon-tile" aria-hidden="true">
                  <img
                    className="service-icon"
                    src={SERVICE_ASSETS[index]}
                    alt=""
                    width="36"
                    height="36"
                  />
                </span>
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
          {statistics.items.map(({ value, suffix, label }) => (
            <div key={label}>
              <CountUpValue value={value} suffix={suffix} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
