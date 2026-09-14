import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/site";
import { LegalSection } from "./LegalSection";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { getSectionId, legalPolicies } from "./legalPolicies";

export function LegalPage({ policyKey }) {
  const navigate = useNavigate();
  const policy = legalPolicies[policyKey];
  const [activeSection, setActiveSection] = useState(getSectionId(policy.sections[0].title));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveSection(getSectionId(policy.sections[0].title));
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (visibleSection) setActiveSection(visibleSection.target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });

    policy.sections.forEach(({ title }) => {
      const element = document.getElementById(getSectionId(title));
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [policy]);

  const scrollTo = (sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });

  return <div className="privacy-page">
    <Header solid />
    <main id="main" className="privacy-main">
      <section className="privacy-intro container">
        <div><p className="privacy-eyebrow">LEGAL</p><h1>{policy.title}</h1><p>{policy.description}</p><time dateTime="2026-09">Last updated: September 2026</time></div>
        <aside aria-hidden="true">BUILD<br />A BRIGHTER<br />DIGITAL WORLD.<i /></aside>
      </section>
      <section className="privacy-content container">
        <aside className="privacy-sidebar"><p>On this page</p><nav aria-label="Legal page sections">
          {policy.sections.map(({ title }) => { const sectionId = getSectionId(title); return <button className={activeSection === sectionId ? "active" : ""} type="button" onClick={() => scrollTo(sectionId)} key={title}>{title}</button>; })}
        </nav></aside>
        <select className="privacy-select" value={activeSection} onChange={(event) => scrollTo(event.target.value)} aria-label="On this page">
          {policy.sections.map(({ title }) => <option value={getSectionId(title)} key={title}>{title}</option>)}
        </select>
        <article className="privacy-article">
          {policy.sections.map((section, index) => <LegalSection section={section} index={index} key={section.title} />)}
          <nav className="privacy-pagination" aria-label="Legal page navigation">
            {policy.links.map(({ label, path, previous }) => <button type="button" onClick={() => navigate(path)} key={path}>{previous && <span aria-hidden="true">← </span>}{label}{!previous && <span aria-hidden="true"> →</span>}</button>)}
          </nav>
        </article>
      </section>
    </main>
    <section className="privacy-cta"><div className="container"><div><p className="privacy-eyebrow">START A PROJECT</p><h2>Turn your idea into a real product.</h2></div><div><p>Tell us what you are building and what needs to happen next.</p><a href={`mailto:${CONTACT_EMAIL}`} className="lime-button">Start a project <span aria-hidden="true">→</span></a></div></div></section>
    <Footer />
  </div>;
}
