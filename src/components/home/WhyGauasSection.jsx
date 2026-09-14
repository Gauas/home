import { ActionLink } from "../common/ActionLink";

const reasons = [
  ["01", "Product and engineering together", "Experience, architecture, and delivery decisions support the same goal."],
  ["02", "Focused scope", "Build what the product needs now while preserving a clear path for change."],
  ["03", "Production ownership", "Deployment, reliability, and ongoing improvement are part of the product work."],
];

export function WhyGauasSection() {
  return (
    <section className="why-gauas">
      <div className="container why-gauas-grid">
        <div className="why-gauas-copy">
          <p className="why-gauas-eyebrow">WHY GAUAS</p>
          <h2>Built clearly.<br />Run reliably.<br /><em>Ready to change.</em></h2>
          <p>GAUAS treats design, software, infrastructure, and production as one connected product problem.</p>
          <ActionLink className="lime-button" to="contact">Start a project →</ActionLink>
        </div>
        <div className="why-gauas-reasons">
          {reasons.map(([number, title, copy], index) => (
            <article className={index === 2 ? "wide" : ""} key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
