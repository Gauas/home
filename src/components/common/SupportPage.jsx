import { CONTACT_EMAIL } from "../../config/site";
import { PageShell } from "./PageShell";
import { FinalCta } from "./FinalCta";

export function SupportPage() {
  return <PageShell className="support-page"><section className="service-detail-hero container"><p className="eyebrow dark">SUPPORT</p><h1>Support for products in production.</h1><p>For an existing GAUAS project, send the product name, what happened, and any useful context. We’ll route the request and respond with the next step.</p><a className="lime-button" href={`mailto:${CONTACT_EMAIL}?subject=GAUAS%20support%20request`}>Email support</a></section><FinalCta /></PageShell>;
}
