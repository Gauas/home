import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
} from "lucide-react";
import { GauasLogo } from "./components/GauasLogo";
import { WorldCanvas } from "./components/world/WorldCanvas";
import { useWorldMotion } from "./lib/motion/useWorldMotion";

const navigation = [
  { label: "Services", href: "#services", state: 1 },
  { label: "Work", href: "#work", state: 2 },
  { label: "Engineering", href: "#engineering", state: 3 },
  { label: "Approach", href: "#process", state: 4 },
];

const services = [
  {
    title: "Web design",
    copy: "Clear structure, responsive pages, and an interface system your team can keep using.",
    outcome: "Structure / interface",
  },
  {
    title: "App development",
    copy: "Production interfaces, useful integrations, testing, and a launch that works on real devices.",
    outcome: "Build / launch",
  },
  {
    title: "Strategy",
    copy: "Customer questions and technical choices turned into a scope people can act on.",
    outcome: "Scope / roadmap",
  },
  {
    title: "Care and support",
    copy: "Monitoring, fixes, content updates, and measured improvements after release.",
    outcome: "Care / iteration",
  },
];

const projects = [
  {
    title: "Nomae",
    type: "Commerce direction",
    scope: "Discovery / Product detail / Checkout",
    copy: "Editorial product discovery and a low-friction purchase path for a considered skincare brand.",
    image: "/assets/project-nomae.webp",
    alt: "Minimal skincare packaging in warm natural light",
  },
  {
    title: "Arden",
    type: "Hospitality direction",
    scope: "Rooms / Local guide / Booking",
    copy: "A room-first booking path and local guide that preserves the property’s quiet atmosphere.",
    image: "/assets/project-arden.webp",
    alt: "Warm, softly lit hotel lounge and library",
  },
  {
    title: "Ledgerline",
    type: "Product direction",
    scope: "Overview / Forecasts / Activity",
    copy: "Responsive dashboards that turn balances, forecasts, and account activity into clear next actions.",
    image: "/assets/project-ledgerline.webp",
    alt: "Financial dashboard shown on desktop and mobile devices",
  },
];

const engineeringFacts = [
  ["Access", "Keyboard paths, useful labels, visible focus, and legible contrast."],
  ["Speed", "Small payloads, responsive interactions, and deliberate loading states."],
  ["Ownership", "Named patterns, documented components, and no black-box handoff."],
];

const process = [
  ["Listen", "Goals, users, constraints, and what already exists."],
  ["Frame", "A written scope: now, later, and what success means."],
  ["Prototype", "Flows and responsive screens, reviewed in small rounds."],
  ["Ship", "Working software shared early and tested on real devices."],
  ["Learn", "A careful release and a useful list of what comes next."],
];

function moveGlassLight(event) {
  if (event.pointerType === "touch") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 100;
  const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 100;
  event.currentTarget.style.setProperty("--glass-x", `${x}%`);
  event.currentTarget.style.setProperty("--glass-y", `${y}%`);
}

function resetGlassLight(event) {
  event.currentTarget.style.removeProperty("--glass-x");
  event.currentTarget.style.removeProperty("--glass-y");
}

function App() {
  const rootRef = useRef(null);
  const controllerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const navigationRef = useRef(null);
  const [world, setWorld] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useWorldMotion(rootRef, world, Boolean(world));

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "GAUAS — Digital product design and engineering";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "GAUAS is a digital product studio for clear websites, useful apps, product strategy, and dependable engineering.",
      );
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const main = document.querySelector("#main-content");
    const focusFirstLink = requestAnimationFrame(() => navigationRef.current?.querySelector("a")?.focus());
    const containFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const links = [...(navigationRef.current?.querySelectorAll("a") ?? [])];
      if (!links.length) return;
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && (document.activeElement === first || !navigationRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    window.addEventListener("keydown", containFocus);
    return () => {
      cancelAnimationFrame(focusFirstLink);
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute("inert");
      window.removeEventListener("keydown", containFocus);
      if (menuToggleRef.current?.isConnected) menuToggleRef.current.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 56.001rem)");
    const closeAtDesktop = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

  const setWorldHover = (method, index) => () => controllerRef.current?.[method]?.(index);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`universe${menuOpen ? " menu-is-open" : ""}`} ref={rootRef}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <WorldCanvas controllerRef={controllerRef} onReady={setWorld} />

      <header className="world-nav">
        <div className="world-nav__inner" onPointerMove={moveGlassLight} onPointerLeave={resetGlassLight}>
          <a className="world-nav__brand" href="#launch" aria-label="GAUAS home" onClick={closeMenu}>
            <GauasLogo className="world-nav__logo" />
          </a>

          <button
            className="menu-toggle"
            ref={menuToggleRef}
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? "Close" : "Menu"}</span>
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>

          <nav
            className="world-nav__links"
            id="primary-navigation"
            aria-label="Primary navigation"
            ref={navigationRef}
          >
            {navigation.map((item) => (
              <a
                href={item.href}
                data-route-state={item.state}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <a className="world-nav__cta" href="#contact" data-route-state="5" onClick={closeMenu}>
              Start a project
            </a>
          </nav>
        </div>
      </header>

      <main className="world-scroll" id="main-content" tabIndex={-1}>
        <section className="world-scene launch" id="launch" aria-labelledby="launch-title">
          <div className="scene__content launch__content">
            <h1 className="scene__title launch__title" id="launch-title">
              We design and build websites and apps.
            </h1>
            <p className="scene__copy launch__copy">
              A small product studio working directly with founders and product teams, from early decisions through launch and support.
            </p>
            <a className="primary-cta" href="#services">
              See what we do
            </a>
          </div>
        </section>

        <section className="world-scene scene scene--right services" id="services" aria-labelledby="services-title">
          <div className="scene__content services__content">
            <header className="services__intro">
              <h2 className="scene__title" id="services-title">What we do.</h2>
              <p className="scene__copy">
                Bring us in for one phase, or keep one small team from discovery through launch.
              </p>
            </header>
            <ol className="services-list" aria-label="GAUAS services">
              {services.map((service, index) => (
                <li
                  key={service.title}
                  onPointerEnter={setWorldHover("setServiceHover", index)}
                  onPointerLeave={setWorldHover("setServiceHover", -1)}
                >
                  <span className="item-number">0{index + 1}</span>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.copy}</p>
                  </div>
                  <small>{service.outcome}</small>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="world-scene scene scene--left scene--work" id="work" aria-labelledby="work-title">
          <div className="scene__content work__content">
            <header className="work__intro">
              <h2 className="scene__title" id="work-title">Three product concepts.</h2>
              <p className="scene__copy">
                Three concept studies for choosing a product, booking a stay, and making a financial decision.
              </p>
            </header>
            <div className="work-showcase">
              <article
                className="work-feature"
                onPointerEnter={setWorldHover("setProjectHover", 0)}
                onPointerLeave={setWorldHover("setProjectHover", -1)}
              >
                <figure>
                  <img src={projects[0].image} alt={projects[0].alt} loading="lazy" />
                  <figcaption>
                    <span>{projects[0].type}</span>
                    <h3>{projects[0].title}</h3>
                    <p>{projects[0].copy}</p>
                    <small>{projects[0].scope}</small>
                    <a
                      className="work-action"
                      href={`mailto:tnqb.job106204@gmail.com?subject=${encodeURIComponent(`A project inspired by ${projects[0].title}`)}`}
                      onFocus={setWorldHover("setProjectHover", 0)}
                      onBlur={setWorldHover("setProjectHover", -1)}
                    >
                      Discuss by email
                    </a>
                  </figcaption>
                </figure>
              </article>
              <ol className="work-index" start="2" aria-label="More project directions">
                {projects.slice(1).map((project, offset) => {
                  const index = offset + 1;
                  return (
                    <li
                      key={project.title}
                      onPointerEnter={setWorldHover("setProjectHover", index)}
                      onPointerLeave={setWorldHover("setProjectHover", -1)}
                    >
                      <span>{project.type}</span>
                      <h3>{project.title}</h3>
                      <p>{project.scope}</p>
                      <a
                        className="work-action"
                        href={`mailto:tnqb.job106204@gmail.com?subject=${encodeURIComponent(`A project inspired by ${project.title}`)}`}
                        onFocus={setWorldHover("setProjectHover", index)}
                        onBlur={setWorldHover("setProjectHover", -1)}
                      >
                        Discuss by email
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="world-scene scene scene--right engineering" id="engineering" aria-labelledby="engineering-title">
          <div className="scene__content engineering__content">
            <div className="engineering__statement">
              <h2 className="scene__title" id="engineering-title">Software that holds up after launch.</h2>
              <p className="scene__copy">
                Loading, errors, keyboard use, maintenance—the invisible details are part of the product.
              </p>
            </div>
            <dl className="engineering-facts" aria-label="Engineering principles">
              {engineeringFacts.map(([title, copy]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{copy}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="world-scene scene scene--left scene--process" id="process" aria-labelledby="process-title">
          <div className="scene__content process__content">
            <header className="process__intro">
              <h2 className="scene__title" id="process-title">A clear process, shared as we go.</h2>
              <p className="scene__copy">Short feedback loops keep expensive surprises out of the final week.</p>
            </header>
            <ol className="process-list" aria-label="GAUAS product process">
              {process.map(([title, copy], index) => (
                <li
                  key={title}
                  data-process-step={index}
                  onPointerEnter={setWorldHover("setProcessHover", index)}
                  onPointerLeave={setWorldHover("setProcessHover", -1)}
                >
                  <span className="item-number">0{index + 1}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="world-scene contact" id="contact" aria-labelledby="contact-title">
          <div className="contact__content">
            <h2 className="scene__title" id="contact-title">Tell us what you’re working on.</h2>
            <p className="scene__copy">
              A half-built product or one stubborn problem is enough. We’ll reply with questions and a concrete next step.
            </p>
            <a className="contact__cta" href="mailto:tnqb.job106204@gmail.com?subject=New%20project%20with%20GAUAS">
              tnqb.job106204@gmail.com
            </a>
            <div className="contact__details">
              <a href="tel:+84367641617">+84 367 641 617</a>
              <span>Saigon / Remote</span>
              <span>© 2026 GAUAS</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
