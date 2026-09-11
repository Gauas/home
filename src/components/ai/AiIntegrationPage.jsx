import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { ActionLink } from "../common/ActionLink";
import { AI_HERO_VIDEO } from "../../config/site";

const models = ["Claude Code", "Codex", "Grok", "Gemini"];
const partners = ["Claude", "OpenAI", "Grok", "Gemini"];

export function AiIntegrationPage({ translations }) {
  return (
    <>
      <Header translations={translations} solid />
      <main className="ai-page" id="main">
        <section className="ai-hero container">
          <div className="ai-copy">
            <p className="ai-eyebrow">AI INTEGRATION</p>
            <h1>Bring AI into<br />your workflow.</h1>
            <p>Connect leading AI models and coding agents into your product, infrastructure, or internal tools. Focus on what you build — we handle the integration.</p>
            <div className="ai-model-list">{models.map((model) => <span key={model}>{model}</span>)}</div>
            <div className="ai-actions"><ActionLink className="lime-button" to="contact">Explore AI integration</ActionLink><button type="button" onClick={() => document.getElementById("ai-benefits")?.scrollIntoView({ behavior: "smooth" })}>Read docs</button></div>
          </div>
          <div className="ai-media">
            <video autoPlay muted loop playsInline preload="metadata" src={AI_HERO_VIDEO} />
          </div>
          <div className="ai-benefits" id="ai-benefits">
            <div><span>FASTER DEVELOPMENT</span><strong>Integrate in days, not months.</strong></div>
            <div><span>MORE POSSIBILITIES</span><strong>Work with the best models.</strong></div>
            <div><span>BUILT FOR REAL PRODUCTS</span><strong>From idea to production.</strong></div>
          </div>
        </section>
        <section className="ai-ecosystem container">
          <p>AI SERVICES BUILT TO INTEGRATE WITH LEADING MODELS</p>
          <div>{partners.map((partner) => <strong key={partner}>{partner}</strong>)}</div>
        </section>
      </main>
      <Footer translations={translations.footer} navigation={translations.nav} />
    </>
  );
}
