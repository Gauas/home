import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { ActionLink } from "../common/ActionLink";

export function ServicePage({ translations, service }) {
  const [title, copy] = service;

  return (
    <>
      <Header translations={translations} solid />
      <main className="service-page" id="main">
        <section className="service-page-hero container">
          <p className="eyebrow dark">GAUAS SERVICES</p>
          <h1>{title}</h1>
          <p>{copy}</p>
          <ActionLink className="lime-button" to="contact">{translations.contact}</ActionLink>
        </section>
      </main>
      <Footer translations={translations.footer} navigation={translations.nav} />
    </>
  );
}
