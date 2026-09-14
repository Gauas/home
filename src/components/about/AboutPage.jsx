import { PageShell } from "../common/PageShell";
import { CapabilitiesSection } from "../common/CapabilitiesSection";
import { FinalCta } from "../common/FinalCta";

const principles = [["Scope before stack", "Choose the smallest useful release before choosing tools."], ["Production is part of the build", "Deployment, monitoring, and operation are product decisions."], ["Leave a clear system", "The team should be able to understand, operate, and extend what ships."]];

export function AboutPage() {
  return (
    <PageShell className="about-page">
      <section className="page-hero about-hero"><div className="container"><p className="eyebrow">ABOUT GAUAS</p><h1>Small team.<br />Serious products.</h1><p>GAUAS is a software studio in Da Nang. We turn business requirements into software that can be shipped, operated, and extended.</p></div></section>
      <section className="studio-approach container">
        <div><p className="eyebrow dark">HOW WE WORK</p><h2>Start with the product problem.</h2></div>
        <div className="studio-approach-copy"><p>Before deciding on screens, frameworks, or infrastructure, we clarify what the product must change for the business and the people using it. That keeps scope, design, and engineering pointed at the same outcome.</p><div>{principles.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>
      <section className="care-section dark-section"><div className="container"><div><p className="eyebrow">WHAT WE CARE ABOUT</p><h2>Quality that holds up after launch.</h2></div><ul>{["Product quality", "Engineering quality", "Performance", "Reliability", "Long-term maintainability"].map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <CapabilitiesSection />
      <FinalCta />
    </PageShell>
  );
}
