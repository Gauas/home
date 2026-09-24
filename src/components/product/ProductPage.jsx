import { ArrowUpRight } from "lucide-react";
import { PageShell } from "../common/PageShell";
import { FinalCta } from "../common/FinalCta";

const PRODUCTS = [
  {
    name: "HunterJob",
    url: "https://hunterjob.gauas.com",
    displayUrl: "hunterjob.gauas.com",
    logo: "/assets/products/hunterjob.png",
  },
];

export function ProductPage() {
  return (
    <PageShell className="product-page">
      <section className="page-hero dark-page-hero product-hero">
        <div className="container">
          <p className="eyebrow">OUR PRODUCTS</p>
          <h1>Products built<br />for real use.</h1>
          <p>Explore the products created and operated by GAUAS.</p>
        </div>
      </section>
      <section className="product-index" aria-labelledby="product-list-title">
        <div className="container">
          <div className="product-index-heading">
            <p className="eyebrow dark">PRODUCT DIRECTORY</p>
            <h2 id="product-list-title">Our products.</h2>
          </div>
          <div className="product-grid">
            {PRODUCTS.map((product, index) => (
              <a className="product-card" href={product.url} target="_blank" rel="noreferrer" key={product.url}>
                <div className="product-logo-wrap">
                  <img src={product.logo} width="1254" height="1254" alt={`${product.name} logo`} />
                </div>
                <div className="product-card-copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{product.name}</h3><p>{product.displayUrl}</p></div>
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </PageShell>
  );
}
