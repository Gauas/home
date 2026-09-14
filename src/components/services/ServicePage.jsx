import { PageShell } from "../common/PageShell";
import { SectionIntro } from "../common/SectionIntro";
import { FaqSection } from "../common/FaqSection";
import { FinalCta } from "../common/FinalCta";
import { useContactModal } from "../contact/ContactModal";
import { WebProjectConfigurator } from "../contact/WebProjectConfigurator";

export function ServicePage({ service }) {
  const { openContactModal } = useContactModal();
  return (
    <PageShell className="service-detail-page">
      <section className="service-detail-hero container">
        <p className="eyebrow dark">{service.eyebrow}</p>
        <h1>{service.title}</h1>
        <p>{service.intro}</p>
        {service.eyebrow === "WEB DEVELOPMENT" ? <WebProjectConfigurator /> : <button className="lime-button" type="button" onClick={openContactModal}>Start a project</button>}
      </section>
      <section className="service-capabilities dark-section">
        <div className="container"><SectionIntro eyebrow="CAPABILITIES" title="What we can build." light /><ul>{service.capabilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      {service.calloutTitle && <section className="service-callout container"><p className="eyebrow dark">FOCUSED SOFTWARE</p><h2>{service.calloutTitle}</h2><p>{service.calloutCopy}</p></section>}
      <section className="service-use-cases container">
        <SectionIntro eyebrow="TYPICAL USE CASES" title="Built around the job it needs to do." />
        <div>{service.useCases.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="service-approach">
        <div className="container"><SectionIntro eyebrow="OUR APPROACH" title="Clear decisions from first scope to production." /><ol>{service.approach.map(([title, copy], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div>
      </section>
      <section className="technology-strip container"><p>TECHNOLOGY & CAPABILITIES</p><ul>{service.technologies.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <FaqSection items={service.faqs} />
      <FinalCta />
    </PageShell>
  );
}
