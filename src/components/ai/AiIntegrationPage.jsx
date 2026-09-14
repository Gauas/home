import { useEffect, useState } from "react";
import { AI_HERO_VIDEO } from "../../config/site";
import { PageShell } from "../common/PageShell";
import { FaqSection } from "../common/FaqSection";
import { FinalCta } from "../common/FinalCta";
import { useContactModal } from "../contact/ContactModal";

const aiProducts = [
  ["KNOWLEDGE", "Answer from company knowledge", "Give customers or teams reliable answers grounded in approved private sources."],
  ["DOCUMENTS", "Turn documents into structured work", "Extract, classify, validate, and route information instead of processing every file by hand."],
  ["OPERATIONS", "Move work across existing systems", "Connect models to APIs, databases, and approval steps with clear boundaries and human control."],
  ["ENGINEERING", "Support development workflows", "Use coding agents where they can inspect context, propose changes, and assist delivery safely."],
];

export function AiIntegrationPage() {
  const { openContactModal } = useContactModal();
  const [motionAllowed, setMotionAllowed] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => { const query = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setMotionAllowed(!query.matches); query.addEventListener("change", update); return () => query.removeEventListener("change", update); }, []);
  return (
    <PageShell className="ai-page">
      <section className="ai-hero container">
        <div className="ai-copy"><p className="ai-eyebrow">AI INTEGRATION</p><h1>Bring AI into<br />your workflow.</h1><p>Connect leading AI platforms to your product, infrastructure, or internal tools. Focus on the business problem—we handle the production integration.</p><div className="ai-model-list"><span>OpenAI</span><span>Anthropic</span><span>Gemini</span><span>xAI</span></div><div className="ai-actions"><button className="lime-button" type="button" onClick={openContactModal}>Start a project</button><button type="button" onClick={() => document.getElementById("ai-products")?.scrollIntoView({ behavior: "smooth" })}>Explore capabilities</button></div></div>
        <div className="ai-media">{motionAllowed ? <video autoPlay muted loop playsInline preload="metadata" poster="/assets/gauas-hero-wave.webp" src={AI_HERO_VIDEO} aria-hidden="true" /> : <img src="/assets/gauas-hero-wave.webp" width="1536" height="1024" alt="" aria-hidden="true" />}</div>
        <div className="ai-benefits"><div><span>FOCUSED INTEGRATION</span><strong>Start with a real workflow.</strong></div><div><span>MODEL FLEXIBILITY</span><strong>Choose the right platform for the job.</strong></div><div><span>PRODUCTION THINKING</span><strong>Design for control and maintainability.</strong></div></div>
      </section>
      <section className="ai-ecosystem container"><p>INTEGRATIONS WITH LEADING AI PLATFORMS</p><div>{["OpenAI", "Anthropic", "Google Gemini", "xAI"].map((partner) => <strong key={partner}>{partner}</strong>)}</div></section>
      <section className="ai-outcomes dark-section" id="ai-products"><div className="container"><header><p className="eyebrow">PRODUCT OUTCOMES</p><h2>Use AI where it changes the workflow.</h2><p>Start with the task, the source of truth, and the action that should follow—not with a model demo.</p></header><div className="ai-outcome-list">{aiProducts.map(([label, title, copy]) => <article key={label}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="developer-agents"><div className="container"><p className="eyebrow dark">DEVELOPER AGENTS</p><h2>Agents inside the engineering system.</h2><div className="developer-agents-detail"><p>Connect coding agents to repository context, development environments, and infrastructure workflows—with review and control kept explicit.</p><div className="agent-platforms"><span>Claude Code</span><span>Codex</span><span>Gemini CLI</span></div></div></div></section>
      <FaqSection items={[["Can GAUAS integrate AI into an existing product?", "Yes. We can add focused AI capabilities to existing interfaces, APIs, internal tools, and data workflows."], ["Do you work with private company knowledge?", "Yes. Retrieval and document systems can be designed around access boundaries, source traceability, and the way the information is used."], ["Are model providers and coding agents the same thing?", "No. Model platforms provide AI capabilities; developer agents are tools built for engineering workflows. We treat them as separate integration layers."]]} />
      <FinalCta />
    </PageShell>
  );
}
