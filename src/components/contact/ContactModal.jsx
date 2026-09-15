import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/site";

const ContactModalContext = createContext(null);

export function useContactModal() {
  const context = useContext(ContactModalContext);
  if (!context) throw new Error("useContactModal must be used inside ContactModalProvider");
  return context;
}

export function ContactModalProvider({ children, translations }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [projectConfig, setProjectConfig] = useState(null);
  const lastTrigger = useRef(null);
  const nameInput = useRef(null);

  const openContactModal = (event, configuration = null) => {
    lastTrigger.current = event?.currentTarget ?? document.activeElement;
    setIsSent(false);
    setProjectConfig(configuration);
    setIsOpen(true);
  };

  const closeContactModal = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeContactModal();
      if (event.key === "Tab") {
        const focusable = [...document.querySelectorAll(".contact-modal button, .contact-modal input, .contact-modal select, .contact-modal textarea, .contact-modal a")];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => nameInput.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastTrigger.current?.focus?.();
    };
  }, [isOpen]);

  const sendMessage = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`${translations.contactForm.subject}: ${data.get("name")}`);
    const body = encodeURIComponent([
      `${translations.contactForm.name}: ${data.get("name")}`,
      `${translations.contactForm.email}: ${data.get("email")}`,
      `${translations.contactForm.company}: ${data.get("company") || "—"}`,
      projectConfig ? `Project configuration: ${JSON.stringify(projectConfig)}` : "",
      "",
      data.get("message"),
    ].join("\n"));

    setIsSent(true);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <ContactModalContext.Provider value={{ openContactModal, closeContactModal }}>
      {children}
      {isOpen && (
        <div className="contact-modal-backdrop" onMouseDown={closeContactModal}>
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="contact-modal-close" type="button" aria-label={translations.contactForm.close} onClick={closeContactModal}>
              <X size={23} strokeWidth={1.7} aria-hidden="true" />
            </button>
            {isSent ? <div className="contact-success" role="status"><p className="contact-modal-eyebrow">READY TO SEND</p><h2 id="contact-modal-title">Your email app should be open.</h2><p>Review the prepared message and send it to {CONTACT_EMAIL}. We’ll reply as soon as we can.</p><button className="contact-modal-submit" type="button" onClick={() => setIsSent(false)}>Edit project details</button></div> : <><p className="contact-modal-eyebrow">START A PROJECT</p>
            <h2 id="contact-modal-title">What are you building?</h2>
            <p className="contact-modal-copy">A few details are enough to start a useful conversation.</p>
            <form onSubmit={sendMessage}>
              <div className="contact-modal-fields">
                <label htmlFor="contact-name"><span className="contact-modal-label">{translations.contactForm.name}<b aria-hidden="true">*</b></span><input id="contact-name" ref={nameInput} name="name" placeholder={translations.contactForm.namePlaceholder} required /></label>
                <label htmlFor="contact-email"><span className="contact-modal-label">{translations.contactForm.email}<b aria-hidden="true">*</b></span><input id="contact-email" name="email" type="email" placeholder={translations.contactForm.emailPlaceholder} required /></label>
                <label htmlFor="contact-company"><span className="contact-modal-label">{translations.contactForm.company} <em>({translations.contactForm.optional})</em></span><input id="contact-company" name="company" placeholder={translations.contactForm.companyPlaceholder} /></label>
              </div>
              <label className="contact-modal-message" htmlFor="contact-message"><span className="contact-modal-label">What are you building?<b aria-hidden="true">*</b></span><textarea id="contact-message" name="message" defaultValue={projectConfig ? "Web Development project configuration is included above. Add any useful context here." : ""} placeholder="The product, current stage, and what you need help with." required /></label>
              <button className="contact-modal-submit" type="submit">Continue in email<ArrowRight size={19} strokeWidth={2} aria-hidden="true" /></button>
            </form>
            <p className="contact-modal-privacy">Your details are used only to respond to this inquiry. Read our <Link to="/privacy" onClick={closeContactModal}>Privacy Policy</Link>.</p></>}
          </section>
        </div>
      )}
    </ContactModalContext.Provider>
  );
}
