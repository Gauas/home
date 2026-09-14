import { useContactModal } from "../contact/ContactModal";

export function FinalCta() {
  const { openContactModal } = useContactModal();
  return (
    <section className="final-cta">
      <div className="container">
        <div><p className="eyebrow">START A PROJECT</p><h2>Build something that works in the real world.</h2></div>
        <div><p>Tell us what you are building, where things stand, and what needs to happen next.</p><button className="lime-button" type="button" onClick={openContactModal}>Start a project</button></div>
      </div>
    </section>
  );
}
