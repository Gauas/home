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
  const lastTrigger = useRef(null);
  const nameInput = useRef(null);

  const openContactModal = (event) => {
    lastTrigger.current = event?.currentTarget ?? document.activeElement;
    setIsOpen(true);
  };

  const closeContactModal = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeContactModal();
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
      `${translations.contactForm.phone}: ${data.get("phone") || "—"}`,
      "",
      data.get("message"),
    ].join("\n"));

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
            <p className="contact-modal-eyebrow">{translations.contactForm.eyebrow}</p>
            <h2 id="contact-modal-title">{translations.contactForm.title}</h2>
            <p className="contact-modal-copy">{translations.contactForm.copy}</p>
            <form onSubmit={sendMessage}>
              <div className="contact-modal-fields">
                <label htmlFor="contact-name"><span className="contact-modal-label">{translations.contactForm.name}<b aria-hidden="true">*</b></span><input id="contact-name" ref={nameInput} name="name" placeholder={translations.contactForm.namePlaceholder} required /></label>
                <label htmlFor="contact-email"><span className="contact-modal-label">{translations.contactForm.email}<b aria-hidden="true">*</b></span><input id="contact-email" name="email" type="email" placeholder={translations.contactForm.emailPlaceholder} required /></label>
                <label htmlFor="contact-company"><span className="contact-modal-label">{translations.contactForm.company} <em>({translations.contactForm.optional})</em></span><input id="contact-company" name="company" placeholder={translations.contactForm.companyPlaceholder} /></label>
                <label htmlFor="contact-phone"><span className="contact-modal-label">{translations.contactForm.phone} <em>({translations.contactForm.optional})</em></span><input id="contact-phone" name="phone" type="tel" placeholder={translations.contactForm.phonePlaceholder} /></label>
              </div>
              <label className="contact-modal-message" htmlFor="contact-message"><span className="contact-modal-label">{translations.contactForm.message}<b aria-hidden="true">*</b></span><textarea id="contact-message" name="message" placeholder={translations.contactForm.messagePlaceholder} required /></label>
              <button className="contact-modal-submit" type="submit">{translations.contactForm.submit}<ArrowRight size={19} strokeWidth={2} aria-hidden="true" /></button>
            </form>
            <p className="contact-modal-privacy">{translations.contactForm.privacy} <Link to="/privacy" onClick={closeContactModal}>{translations.contactForm.privacyLink}</Link>.</p>
          </section>
        </div>
      )}
    </ContactModalContext.Provider>
  );
}
