import { ArrowUpRight, Building2, Search, Zap } from "lucide-react";
import { PageShell } from "../common/PageShell";
import { FinalCta } from "../common/FinalCta";

const PRODUCTS = [
  {
    name: "HunterJob",
    url: "https://hunterjob.gauas.com",
    category: "JOB SEARCH",
    description: "A job search platform that automatically collects job openings from company career pages, helping you search, filter, and discover new opportunities faster.",
    logo: "/assets/products/hunterjob.png",
    preview: "/assets/products/hunterjob-interface.png",
    features: [
      { title: "Real sources", copy: "Links to original job posts", icon: Building2 },
      { title: "Fresh daily", copy: "Automatically refreshed", icon: Zap },
      { title: "Smart search", copy: "Find the right role faster", icon: Search },
    ],
  },
];

export function ProductPage() {
  return (
    <PageShell className="product-page">
      <section className="page-hero dark-page-hero product-hero">
        <div className="container">
          <p className="eyebrow">PRODUCTS</p>
          <h1>Products built<br />for real use.</h1>
          <p>We build and operate practical products that solve real problems. Explore what we have created so far.</p>
        </div>
      </section>
      <div className="product-index" aria-label="Product directory">
        {PRODUCTS.map((product, index) => (
          <section className="product-showcase container" key={product.url}>
            <div className="product-story">
              <div className="product-kicker"><span>{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true" /><strong>{product.category}</strong></div>
              <div className="product-identity">
                <img src={product.logo} width="1254" height="1254" alt="" />
                <h2>{product.name}</h2>
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-features">
                {product.features.map(({ title, copy, icon: Icon }) => (
                  <div key={title}><Icon aria-hidden="true" /><p><strong>{title}</strong><span>{copy}</span></p></div>
                ))}
              </div>
              <div className="product-actions">
                <a className="dark-button" href={product.url} target="_blank" rel="noreferrer">Visit {product.name}<ArrowUpRight size={17} aria-hidden="true" /></a>
                <a className="product-learn-link" href={product.url} target="_blank" rel="noreferrer">Learn more</a>
              </div>
            </div>
            <a className="product-preview" href={product.url} target="_blank" rel="noreferrer" aria-label={`Visit ${product.name}`}>
              <img src={product.preview} width="1586" height="992" alt={`${product.name} job search interface with employer identities hidden`} />
            </a>
          </section>
        ))}
      </div>
      <FinalCta />
    </PageShell>
  );
}
