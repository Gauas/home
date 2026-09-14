import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useContactModal } from "./ContactModal";

const projectTypes = [
  ["landing-page", "Landing Page", "A focused page for a product, campaign, or idea."],
  ["interactive-website", "Interactive Website", "A multi-page website with richer interactions."],
  ["e-commerce", "E-commerce", "A storefront for selling products or services."],
  ["web-application", "Web Application", "A product with application-level functionality."],
];
const timelines = [["asap", "ASAP"], ["2-4-weeks", "2–4 weeks"], ["1-2-months", "1–2 months"], ["3-6-months", "3–6 months"], ["flexible", "Flexible"]];
const technologyOptions = {
  frontend: ["Next.js", "React", "Vue", "Nuxt", "Other"],
  backend: ["Go", "Node.js", ".NET", "Java", "Python", "Other"],
  database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Other"],
};

export function WebProjectConfigurator() {
  const { openContactModal } = useContactModal();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [technologies, setTechnologies] = useState({ frontend: [], backend: [], database: [] });
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  const close = () => setOpen(false);
  const skip = () => {
    if (step === 1) setProjectType(null);
    if (step === 2) setTimeline(null);
    if (step === 3) setTechnologies({ frontend: [], backend: [], database: [] });
    if (step < 3) setStep((current) => current + 1);
  };
  const toggleTechnology = (group, item) => setTechnologies((current) => ({ ...current, [group]: current[group].includes(item) ? current[group].filter((value) => value !== item) : [...current[group], item] }));
  const complete = () => {
    const config = { service: "web-development", projectType, timeline, technologies };
    close();
    openContactModal(undefined, config);
  };

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeydown = (event) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const focusable = [...document.querySelectorAll(".project-configurator button, .project-configurator input, .project-configurator summary")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKeydown);
    requestAnimationFrame(() => closeRef.current?.focus());
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeydown); triggerRef.current?.focus(); };
  }, [open]);

  return <>
    <button ref={triggerRef} className="lime-button" type="button" onClick={() => setOpen(true)}>Start a project</button>
    {open && <div className="project-configurator-backdrop" onMouseDown={close}>
      <section className="project-configurator" role="dialog" aria-modal="true" aria-labelledby="project-configurator-title" onMouseDown={(event) => event.stopPropagation()}>
        <aside className="project-configurator-rail"><div><p>WEB DEVELOPMENT</p><span>{String(step).padStart(2, "0")} / 03</span></div><div><strong>WEB DEVELOPMENT</strong><p>From focused landing pages to production web applications.</p></div></aside>
        <div className="project-configurator-main">
          <button ref={closeRef} className="project-configurator-close" type="button" aria-label="Close project configurator" onClick={close}><X size={25} strokeWidth={1.5} /></button>
          <div className="project-configurator-mobile-title"><strong>WEB DEVELOPMENT</strong><span>{String(step).padStart(2, "0")} / 03</span></div>
          <ol className="project-configurator-progress" aria-label="Project configuration progress">{[[1, "Project type"], [2, "Timeline"], [3, "Technology"]].map(([number, label]) => <li key={number} className={number <= step ? "active" : ""}><span>0{number}</span>{label}</li>)}</ol>
          <div className="project-configurator-step" key={step}>
            {step === 1 && <><p className="project-configurator-label">01 / PROJECT TYPE</p><h2 id="project-configurator-title">What are you looking to build?</h2><p className="project-configurator-copy">Choose the closest starting point. You can change this later.</p><div className="project-type-grid">{projectTypes.map(([value, title, copy]) => <button key={value} type="button" className="project-type-option" aria-pressed={projectType === value} onClick={() => setProjectType(value)}><strong>{title}</strong><span>{copy}</span></button>)}</div></>}
            {step === 2 && <><p className="project-configurator-label">02 / TIMELINE</p><h2 id="project-configurator-title">When do you want to launch?</h2><p className="project-configurator-copy">A rough timeframe helps us plan the right first release.</p><div className="timeline-selector" role="radiogroup" aria-label="Launch timeline">{timelines.map(([value, label]) => <button key={value} type="button" role="radio" aria-checked={timeline === value} onClick={() => setTimeline(value)}><i aria-hidden="true" /><span>{label}</span></button>)}</div></>}
            {step === 3 && <><p className="project-configurator-label">03 / TECHNOLOGY</p><h2 id="project-configurator-title">Any technology preferences?</h2><p className="project-configurator-copy">Optional — leave this to us if you&apos;re not sure.</p><div className="technology-selects">{Object.entries(technologyOptions).map(([group, options]) => <details key={group}><summary>{group}<span>{technologies[group].length ? `${technologies[group].length} selected` : "Select"}</span></summary><div>{options.map((option) => <label key={option}><input type="checkbox" checked={technologies[group].includes(option)} onChange={() => toggleTechnology(group, option)} />{option}</label>)}</div></details>)}</div><button className="no-preference" type="button" onClick={() => setTechnologies({ frontend: [], backend: [], database: [] })}>No preference — let GAUAS decide.</button></>}
          </div>
          <div className="project-configurator-actions">{step > 1 ? <button type="button" className="project-configurator-text-button" onClick={() => setStep((current) => current - 1)}>Back</button> : <span />}{step < 3 && <button type="button" className="project-configurator-text-button" onClick={skip}>Skip for now</button>}<button className="dark-button project-configurator-next" type="button" onClick={() => step === 3 ? complete() : setStep((current) => current + 1)}>{step === 3 ? "Continue to project brief" : "Next"}<ArrowRight size={18} /></button></div>
        </div>
      </section>
    </div>}
  </>;
}
