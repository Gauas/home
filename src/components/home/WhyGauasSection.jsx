import { ActionLink } from "../common/ActionLink";

const reasons = [
  ["01", "Cost-efficient development", "High-quality products with optimized development costs for your budget."],
  ["02", "Quality-driven design", "Clean, thoughtful interfaces built with usability, consistency, and detail in mind."],
  ["03", "Fast delivery", "A focused process that moves quickly from idea to production."],
];

export function WhyGauasSection() {
  return (
    <section className="why-gauas">
      <div className="container why-gauas-grid">
        <div className="why-gauas-copy">
          <p className="why-gauas-eyebrow">WHY GAUAS</p>
          <h2>Build faster.<br />Spend smarter.<br /><em>Ship better.</em></h2>
          <p>Gauas helps you move from idea to production with optimized development costs, thoughtful design, and a focused delivery process.</p>
          <ActionLink className="lime-button" to="contact">Let&apos;s build together →</ActionLink>
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
