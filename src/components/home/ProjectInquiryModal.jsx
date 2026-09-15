import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, X } from "lucide-react";
import { CONTACT_EMAIL } from "../../config/site";

const PLACEHOLDERS = {
  "Web Development": "A website for our new product...",
  "Mobile Applications": "A mobile app for booking...",
  "AI Integration": "An AI assistant connected to our internal data...",
  "Internal Tools": "A dashboard for our operations team...",
};

const SERVICE_CONTEXT = {
  "Web Development": {
    icon: "/assets/icons/website.svg",
    questions: [{ field: "projectType", label: "What kind of website?", multiple: false, options: ["Landing page", "Data-driven web app", "E-commerce / sales"] }],
  },
  "Mobile Applications": {
    icon: "/assets/icons/mobile-application.svg",
    questions: [{ field: "platforms", label: "Target platforms", multiple: true, options: ["iOS", "Android"] }],
  },
  "AI Integration": {
    icon: "/assets/icons/ai-integration.svg",
    questions: [
      { field: "approach", label: "What do you need?", multiple: false, options: ["Integrate into an existing app", "Build a new AI service"] },
      { field: "channels", label: "Where should it work?", multiple: true, options: ["Existing web app", "Zalo", "Slack", "Discord", "Internal tools"] },
    ],
  },
  "Internal Tools": {
    icon: "/assets/icons/internal-tools.svg",
    questions: [{ field: "platforms", label: "Target systems", multiple: true, options: ["Windows", "Linux"] }],
  },
};

const WEB_TECHNOLOGIES = {
  frontend: {
    label: "Frontend / Platform",
    options: ["React", "Next.js", "Vue", "Nuxt", "Angular", "Flutter", "React Native", "iOS", "Android", "Other"],
  },
  backend: {
    label: "Backend",
    options: ["Go", "Node.js", "NestJS", ".NET", "Java / Spring", "Python", "PHP / Laravel", "Other"],
  },
  database: {
    label: "Database",
    options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL Server", "Other"],
  },
  infrastructure: {
    label: "Infrastructure",
    options: ["AWS", "Google Cloud", "Azure", "Cloudflare", "Kubernetes", "Docker", "On-premise", "Other"],
  },
};

const MOBILE_TECHNOLOGIES = {
  ios: { label: "iOS development", options: ["Swift", "SwiftUI", "UIKit", "Objective-C", "Other"] },
  android: { label: "Android development", options: ["Kotlin", "Jetpack Compose", "Java", "Android Views", "Other"] },
};
const EMPTY_CONTACT = { name: "", company: "", email: "", phone: "" };

function MultiSelect({ definition, value, onChange }) {
  const { label, options } = definition;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchId = useId();
  const listId = useId();
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [isOpen]);

  const toggle = (option) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  return (
    <div className={`inquiry-multiselect ${isOpen ? "open" : ""}`} ref={rootRef}>
      <span className="inquiry-field-label" id={`${searchId}-label`}>{label}</span>
      <button
        className="inquiry-select-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-labelledby={`${searchId}-label`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{value.length ? `${value.length} selected` : "No preference"}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {value.length > 0 && (
        <div className="inquiry-chips" aria-label={`Selected ${label}`}>
          {value.map((item) => (
            <button key={item} type="button" onClick={() => toggle(item)} aria-label={`Remove ${item}`}>
              {item}<X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      {isOpen && (
        <div className="inquiry-options" id={listId}>
          <label className="inquiry-search" htmlFor={searchId}>
            <span className="sr-only">Search {label}</span>
            <input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" autoComplete="off" autoFocus />
          </label>
          <div className="inquiry-option-list" role="group" aria-label={`${label} options`}>
            {filteredOptions.map((option) => (
              <label key={option} className="inquiry-option">
                <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} />
                <span>{option}</span>
                {value.includes(option) && <Check size={14} aria-hidden="true" />}
              </label>
            ))}
            {!filteredOptions.length && <p>No matching options</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectInquiryModal({ service, onClose }) {
  const [step, setStep] = useState("idea");
  const [idea, setIdea] = useState("");
  const [hasTechPreferences, setHasTechPreferences] = useState(false);
  const [technologyPreferences, setTechnologyPreferences] = useState({});
  const [preferencesSkipped, setPreferencesSkipped] = useState(false);
  const [serviceDetails, setServiceDetails] = useState({});
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const ideaRef = useRef(null);
  const contactNameRef = useRef(null);
  const lastFocused = useRef(document.activeElement);
  const dirtyRef = useRef(false);
  const stepRef = useRef(step);
  const onCloseRef = useRef(onClose);

  const serviceContext = SERVICE_CONTEXT[service];
  const mobilePlatforms = serviceDetails.platforms || [];
  const showsPreferences = service === "Web Development" ? hasTechPreferences : service === "Mobile Applications" && mobilePlatforms.length > 0;
  const technologyFields = service === "Web Development"
    ? WEB_TECHNOLOGIES
    : Object.fromEntries(mobilePlatforms.map((platform) => [platform.toLowerCase(), MOBILE_TECHNOLOGIES[platform.toLowerCase()]]));
  const steps = showsPreferences ? ["idea", "preferences", "contact"] : ["idea", "contact"];
  const stepIndex = Math.max(0, steps.indexOf(step));
  const isDirty = useMemo(() => (
    idea.trim().length >= 5 ||
    Object.values(contact).some((value) => value.trim()) ||
    Object.values(serviceDetails).some((value) => Array.isArray(value) ? value.length : Boolean(value)) ||
    Object.values(technologyPreferences).some((values) => values.length)
  ), [contact, idea, serviceDetails, technologyPreferences]);

  dirtyRef.current = isDirty;
  stepRef.current = step;
  onCloseRef.current = onClose;

  const requestClose = () => {
    if (stepRef.current !== "success" && dirtyRef.current && !window.confirm("Discard this project inquiry? Your entered details will be lost.")) return;
    onCloseRef.current();
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => ideaRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...modalRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (step === "contact") requestAnimationFrame(() => contactNameRef.current?.focus());
  }, [step]);

  const continueFromIdea = () => {
    if (!idea.trim()) {
      setErrors({ idea: "Please share a short description of what you want to build." });
      ideaRef.current?.focus();
      return;
    }
    setErrors({});
    setStep(showsPreferences ? "preferences" : "contact");
  };

  const updateTech = (field, value) => {
    setTechnologyPreferences((current) => ({ ...current, [field]: value }));
  };

  const toggleServiceDetail = (question, option) => {
    const { field, multiple } = question;
    if (!multiple) {
      setServiceDetails((current) => ({ ...current, [field]: option }));
      return;
    }
    const currentValues = serviceDetails[field] || [];
    setServiceDetails((current) => ({
      ...current,
      [field]: currentValues.includes(option) ? currentValues.filter((item) => item !== option) : [...currentValues, option],
    }));
  };

  const updateContact = (field, value) => {
    setContact((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, identity: undefined, contact: undefined, email: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!contact.name.trim() && !contact.company.trim()) nextErrors.identity = "Add your name or company.";
    if (!contact.email.trim() && !contact.phone.trim()) nextErrors.contact = "Add an email address or phone number.";
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) nextErrors.email = "Enter a valid email address.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      service,
      serviceDetails: Object.keys(serviceDetails).length ? serviceDetails : null,
      idea: idea.trim(),
      technologyPreferences: showsPreferences && !preferencesSkipped ? technologyPreferences : null,
      contact: Object.fromEntries(Object.entries(contact).map(([key, value]) => [key, value.trim() || null])),
    };

    const body = encodeURIComponent(JSON.stringify(payload, null, 2));
    const subject = encodeURIComponent(`Project inquiry — ${service}`);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setIsSubmitting(false);
    setStep("success");
  };

  const progressLabel = step === "idea" ? "Share idea" : step === "preferences" ? "Preferences" : "Contact";

  return (
    <div className="inquiry-backdrop" onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
      <section className="inquiry-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
        <button className="inquiry-close" type="button" aria-label="Close project inquiry" onClick={requestClose}>
          <X size={20} strokeWidth={1.7} aria-hidden="true" />
        </button>

        {step !== "success" && (
          <header className="inquiry-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}: ${progressLabel}`}>
            <span>{String(stepIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
            <p>START A PROJECT <small>· {progressLabel}</small></p>
            <i><b style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></i>
          </header>
        )}

        <div className="inquiry-step" key={step}>
          {step === "idea" && (
            <>
              <h2 id="inquiry-title">Tell us what you want to build.</h2>
              <p className="inquiry-copy">Share a few words about your idea. It doesn’t need to be detailed.</p>
              <div className="inquiry-service">
                <img src={serviceContext.icon} alt="" aria-hidden="true" />
                <span>Selected service</span>
                <strong>{service}</strong>
              </div>
              {serviceContext.questions.map((question) => (
                <fieldset className="inquiry-service-options" key={question.field}>
                  <legend>{question.label}<small>Optional</small></legend>
                  <div>
                    {question.options.map((option) => {
                      const currentValue = serviceDetails[question.field];
                      const checked = question.multiple ? (currentValue || []).includes(option) : currentValue === option;
                      return (
                        <label key={option}>
                          <input
                            type={question.multiple ? "checkbox" : "radio"}
                            name={`service-${question.field}`}
                            checked={checked}
                            onChange={() => toggleServiceDetail(question, option)}
                          />
                          <span aria-hidden="true"><Check size={12} /></span>
                          <b>{option}</b>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <label className="inquiry-idea" htmlFor="inquiry-idea">
                <span className="sr-only">Project idea</span>
                <textarea id="inquiry-idea" ref={ideaRef} value={idea} onChange={(event) => { setIdea(event.target.value); setErrors({}); }} placeholder={PLACEHOLDERS[service]} aria-invalid={Boolean(errors.idea)} aria-describedby={errors.idea ? "idea-error" : undefined} />
              </label>
              {errors.idea && <p className="inquiry-error" id="idea-error" role="alert">{errors.idea}</p>}
              {service === "Web Development" && <label className="inquiry-tech-toggle">
                <input type="checkbox" checked={hasTechPreferences} onChange={(event) => setHasTechPreferences(event.target.checked)} />
                <span aria-hidden="true"><Check size={13} /></span>
                <b>I have preferred technologies<small>Optional — tell us your preferred stack.</small></b>
              </label>}
              <div className="inquiry-actions">
                <button className="inquiry-secondary" type="button" onClick={requestClose}>Cancel</button>
                <button className="inquiry-primary" type="button" onClick={continueFromIdea}>Continue <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </>
          )}

          {step === "preferences" && (
            <>
              <h2 id="inquiry-title">Any technology preferences?</h2>
              <p className="inquiry-copy">Optional. Leave anything blank and we’ll recommend what fits best.</p>
              <div className="inquiry-tech-grid">
                {Object.entries(technologyFields).map(([field, definition]) => <MultiSelect key={field} definition={definition} value={technologyPreferences[field] || []} onChange={(value) => updateTech(field, value)} />)}
              </div>
              <div className="inquiry-actions inquiry-actions-three">
                <button className="inquiry-secondary" type="button" onClick={() => setStep("idea")}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
                <button className="inquiry-secondary" type="button" onClick={() => { setPreferencesSkipped(true); setStep("contact"); }}>Skip</button>
                <button className="inquiry-primary" type="button" onClick={() => { setPreferencesSkipped(false); setStep("contact"); }}>Continue <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </>
          )}

          {step === "contact" && (
            <form onSubmit={submit} noValidate>
              <h2 id="inquiry-title">How should we reach you?</h2>
              <p className="inquiry-copy">Just the essentials. We’ll discuss everything else with you.</p>
              <div className="inquiry-contact-grid">
                <label><span>Name</span><input ref={contactNameRef} value={contact.name} onChange={(event) => updateContact("name", event.target.value)} placeholder="Your name" autoComplete="name" /></label>
                <label><span>Company</span><input value={contact.company} onChange={(event) => updateContact("company", event.target.value)} placeholder="Company name" autoComplete="organization" /></label>
                <label><span>Email</span><input value={contact.email} onChange={(event) => updateContact("email", event.target.value)} placeholder="you@company.com" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(errors.email)} /></label>
                <label><span>Phone</span><input value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} placeholder="+84 ..." type="tel" inputMode="tel" autoComplete="tel" /></label>
              </div>
              {(errors.identity || errors.contact || errors.email) && (
                <div className="inquiry-validation" role="alert">
                  {errors.identity && <p>{errors.identity}</p>}
                  {errors.contact && <p>{errors.contact}</p>}
                  {errors.email && <p>{errors.email}</p>}
                </div>
              )}
              <div className="inquiry-actions">
                <button className="inquiry-secondary" type="button" onClick={() => setStep(showsPreferences ? "preferences" : "idea")}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
                <button className="inquiry-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send requirement"}{!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}</button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="inquiry-success" role="status">
              <span className="inquiry-success-icon"><Check size={16} aria-hidden="true" /></span>
              <h2 id="inquiry-title">Your requirements have been sent.</h2>
              <p className="inquiry-copy">Thanks for sharing your idea. We’ll review it and get back to you soon.</p>
              <button className="inquiry-primary" type="button" onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
