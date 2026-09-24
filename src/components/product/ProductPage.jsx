import { ArrowUpRight } from "lucide-react";
import { PageShell } from "../common/PageShell";

const PRODUCTS = [
  {
    name: "HunterJob",
    url: "https://hunterjob.gauas.com",
    category: "JOB SEARCH",
    description: "Job discovery from official company career pages, with direct links back to the original source.",
    logo: "/assets/products/hunterjob.png",
    preview: "/assets/products/hunterjob-screenshot.png",
    type: "Web application",
    status: "Live",
  },
];

export function ProductPage() {
  return (
    <PageShell className="product-page">
      <section className="page-hero dark-page-hero product-hero">
        <div className="container">
          <p className="eyebrow">PRODUCTS</p>
          <h1>Software we<br />build and run.</h1>
          <p>A directory of products owned and operated by GAUAS.</p>
        </div>
      </section>
      <div className="product-index" aria-label="Product directory">
        {PRODUCTS.map((product, index) => (
          <section className="product-showcase container" key={product.url}>
            <div className="product-story">
              <div className="product-kicker"><span>{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true" /><strong>{product.category}</strong><em>{product.status}</em></div>
              <div className="product-identity">
                <img src={product.logo} width="1254" height="1254" alt="" />
                <h2>{product.name}</h2>
              </div>
              <p className="product-description">{product.description}</p>
              <dl className="product-facts"><div><dt>TYPE</dt><dd>{product.type}</dd></div><div><dt>STATUS</dt><dd>{product.status}</dd></div></dl>
              <a className="product-visit" href={product.url} target="_blank" rel="noreferrer">Open {product.name}<ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
            <figure className="product-preview">
              <a href={product.url} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><img src={product.preview} width="1080" height="460" alt={`${product.name} interface with employer names anonymized`} /></a>
              <figcaption>Live product interface <span>Employer identities anonymized</span></figcaption>
            </figure>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
