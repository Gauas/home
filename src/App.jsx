import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { GauasLogo } from "./components/GauasLogo";
import { WorldCanvas } from "./components/world/WorldCanvas";
import { useWorldMotion } from "./lib/motion/useWorldMotion";
import { WORLD_STATE_META } from "./lib/world/WorldStateMeta";

const services = [
  { title: "WEB DESIGN", copy: "Editorial websites built around a clear story and useful path." },
  { title: "APP DEVELOPMENT", copy: "Focused web and mobile products engineered for steady growth." },
  { title: "STRATEGY & CONSULTING", copy: "Product direction and technical decisions made concrete." },
  { title: "CARE & SUPPORT", copy: "Long-term maintenance and thoughtful iteration after launch." },
];

const templates = [
  { number: "01", title: "E-COMMERCE", type: "EDITORIAL STOREFRONTS" },
  { number: "02", title: "HOSPITALITY", type: "HOTELS & DESTINATIONS" },
  { number: "03", title: "FINTECH & SAAS", type: "PRODUCT PLATFORMS" },
];

const process = [
  ["DISCOVER", "Find the real goal."],
  ["DEFINE", "Set the route forward."],
  ["DESIGN", "Give the system form."],
  ["DEVELOP", "Make it work beautifully."],
  ["LAUNCH", "Ship, learn, and grow."],
];

function SceneIndex({ children }) {
  return <p className="scene__index">DESTINATION / {children}</p>;
}

function App() {
  const rootRef = useRef(null);
  const controllerRef = useRef(null);
  const [world, setWorld] = useState(null);
  useWorldMotion(rootRef, world, Boolean(world));

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "GAUAS Star Route — Navigate ideas. Build real products.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Travel the GAUAS Star Route: web design, app development, strategy, engineering, and digital product delivery.");
  }, []);

  const setWorldHover = (method, index) => () => controllerRef.current?.[method]?.(index);

  return (
    <div className="universe" ref={rootRef}>
      <a className="skip-link" href="#services">Skip to services</a>
      <WorldCanvas controllerRef={controllerRef} onReady={setWorld} />

      <header className="world-nav" aria-label="Primary navigation">
        <a className="world-nav__logo" href="#launch" aria-label="GAUAS Star Route home"><GauasLogo /></a>
        <div className="world-state" aria-live="polite" aria-atomic="true">
          <span className="world-state__number">01</span>
          <span className="world-state__name">LAUNCH STATION</span>
        </div>
        <nav className="world-nav__links" aria-label="Destinations">
          <a href="#services">SERVICES</a>
          <a href="#templates">TEMPLATES</a>
          <a href="#process">PROCESS</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <nav className="route-map" aria-label="Star route progress">
        {WORLD_STATE_META.map((state, index) => (
          <a href={`#${["launch", "services", "templates", "engineering", "process", "contact"][index]}`} data-route-state={state.id} key={state.name}>
            <i /><span>{state.short}</span>
          </a>
        ))}
      </nav>
      <div className="world-progress" aria-hidden="true"><i className="world-progress__fill" /></div>

      <main className="world-scroll">
        <section className="world-scene launch" id="launch" aria-labelledby="launch-title">
          <div className="scene__content launch__content">
            <GauasLogo className="intro__logo launch__logo" />
            <p className="launch__kicker">DIGITAL PRODUCT STUDIO / STAR ROUTE 01</p>
            <h1 className="scene__title launch__title" id="launch-title">NAVIGATE IDEAS. BUILD REAL PRODUCTS.</h1>
            <p className="scene__copy">GAUAS designs and engineers useful digital products for ambitious teams.</p>
            <div className="intro__meta launch__actions">
              <a className="primary-cta" href="#services">BEGIN THE JOURNEY <ArrowRight aria-hidden="true" size={16} /></a>
              <a className="text-link" href="#templates">EXPLORE TEMPLATES</a>
              <span className="scroll-cue"><ArrowDown aria-hidden="true" size={16} /> SCROLL TO LAUNCH</span>
            </div>
          </div>
        </section>

        <section className="world-scene scene scene--right" id="services" aria-labelledby="services-title">
          <div className="scene__content">
            <SceneIndex>02 / SERVICES PLANET</SceneIndex>
            <h2 className="scene__title" id="services-title">CAPABILITIES IN ORBIT.</h2>
            <p className="scene__copy">Four connected disciplines. One product-minded team.</p>
            <ol className="destination-list service-list" aria-label="GAUAS services">
              {services.map((service, index) => (
                <li key={service.title}>
                  <button
                    type="button"
                    onPointerEnter={setWorldHover("setServiceHover", index)}
                    onPointerLeave={setWorldHover("setServiceHover", -1)}
                    onFocus={setWorldHover("setServiceHover", index)}
                    onBlur={setWorldHover("setServiceHover", -1)}
                  >
                    <span>0{index + 1}</span>
                    <strong>{service.title}</strong>
                    <small>{service.copy}</small>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="world-scene scene scene--left scene--projects" id="templates" aria-labelledby="templates-title">
          <div className="scene__content">
            <SceneIndex>03 / TEMPLATE ORBIT</SceneIndex>
            <h2 className="scene__title" id="templates-title">WEBSITE TEMPLATES IN ORBIT.</h2>
            <p className="scene__copy">Curated starting points for distinct industries, designed to adapt to each brand.</p>
            <ol className="project-ledger" aria-label="Website template categories">
              {templates.map((template, index) => (
                <li key={template.title}>
                  <button
                    type="button"
                    onPointerEnter={setWorldHover("setProjectHover", index)}
                    onPointerLeave={setWorldHover("setProjectHover", -1)}
                    onFocus={setWorldHover("setProjectHover", index)}
                    onBlur={setWorldHover("setProjectHover", -1)}
                  >
                    <span>{template.number}</span>
                    <strong>{template.title}</strong>
                    <small>{template.type}</small>
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </button>
                </li>
              ))}
            </ol>
            <div className="project-counter" aria-hidden="true"><span>01</span><i /><b>03</b></div>
          </div>
        </section>

        <section className="world-scene scene scene--right" id="engineering" aria-labelledby="engineering-title">
          <div className="scene__content">
            <SceneIndex>04 / ENGINEERING PLANET</SceneIndex>
            <h2 className="scene__title" id="engineering-title">SYSTEMS BUILT TO TRAVEL FAR.</h2>
            <p className="scene__copy">Fast interfaces, resilient architecture, and foundations your team can evolve.</p>
            <ul className="engineering-ledger" aria-label="Engineering qualities">
              <li>ACCESSIBLE BY DEFAULT</li>
              <li>PERFORMANCE-LED</li>
              <li>MAINTAINABLE SYSTEMS</li>
              <li>REAL-WORLD RELIABILITY</li>
            </ul>
          </div>
        </section>

        <section className="world-scene scene scene--left scene--process" id="process" aria-labelledby="process-title">
          <div className="scene__content">
            <SceneIndex>05 / PROCESS ORBIT</SceneIndex>
            <h2 className="scene__title" id="process-title">A CLEAR ROUTE TO LAUNCH.</h2>
            <ol className="process-list" aria-label="GAUAS product process">
              {process.map(([title, copy], index) => (
                <li key={title} data-process-step={index}>
                  <button
                    type="button"
                    onPointerEnter={setWorldHover("setProcessHover", index)}
                    onPointerLeave={setWorldHover("setProcessHover", -1)}
                    onFocus={setWorldHover("setProcessHover", index)}
                    onBlur={setWorldHover("setProcessHover", -1)}
                  >
                    <span>0{index + 1}</span><strong>{title}</strong><small>{copy}</small>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="world-scene contact" id="contact" aria-labelledby="contact-title">
          <div className="contact__content">
            <SceneIndex>06 / CONTACT BEACON</SceneIndex>
            <GauasLogo className="contact__logo" />
            <h2 className="scene__title" id="contact-title">READY TO BUILD SOMETHING REAL?</h2>
            <p className="scene__copy">Your route starts with one clear conversation.</p>
            <a className="contact__cta" href="mailto:tnqb.job106204@gmail.com">START A PROJECT <ArrowUpRight aria-hidden="true" size={20} /></a>
            <div className="contact__details">
              <a href="mailto:tnqb.job106204@gmail.com">TNQB.JOB106204@GMAIL.COM</a>
              <a href="tel:+84367641617">+84 367 641 617</a>
              <span>© 2026 GAUAS</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
