import { Link } from "react-router-dom";
import { SERVICES } from "../../config/site";
import { InteractiveServiceCard } from "./InteractiveServiceCard";

export function ServicesSection() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="services-intro reveal"><div><p className="eyebrow dark">WHAT GAUAS CAN DO</p><h2>Everything you need to start and grow.</h2></div><p>Focus on your product. GAUAS takes care of design, delivery, and improvement.</p><Link className="services-view-all" to="/about">View all</Link></div>
        <div className="service-row">{SERVICES.map((service, index) => <InteractiveServiceCard title={service.label} copy={service.description} href={service.href} index={index} key={service.href} />)}</div>
      </div>
    </section>
  );
}
