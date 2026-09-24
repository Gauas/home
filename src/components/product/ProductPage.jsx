import { ArrowUpRight, Link2, Search, Zap } from "lucide-react";
import { PageShell } from "../common/PageShell";

const PRODUCTS = [
  {
    name: "HunterJob",
    url: "https://hunterjob.gauas.com",
    category: "JOB SEARCH",
    description: "A job search platform that collects job openings directly from company career pages, helping you search, filter, and discover new opportunities faster.",
    logo: "/assets/products/hunterjob.png",
    preview: "/assets/products/hunterjob-showcase.webp",
    features: [
      { title: "Direct from company sources", copy: "Job openings are collected from official career pages.", icon: Link2 },
      { title: "Updated daily", copy: "Automatically crawl and detect new opportunities.", icon: Zap },
      { title: "Search smarter", copy: "Find the right jobs with filters and AI-powered recommendations (in development).", icon: Search },
    ],
  },
];

export function ProductPage() {
  return (
    <PageShell className="product-page">
      <section className="page-hero dark-page-hero product-hero">
        <div className="container">
          <p className="eyebrow">PRODUCTS</p>
          <h1>Quality products.<br />Made by Gauas.</h1>
          <p>A collection of high-quality products designed,<br />built, and operated by Gauas.</p>
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
                {product.features.map(({ title, copy, icon: Icon }) => <div key={title}><span><Icon aria-hidden="true" /></span><p><strong>{title}</strong><small>{copy}</small></p></div>)}
              </div>
              <div className="product-actions"><a className="dark-button" href={product.url} target="_blank" rel="noreferrer">Visit {product.name}<ArrowUpRight size={16} aria-hidden="true" /></a><a href={product.url} target="_blank" rel="noreferrer">Learn more</a></div>
            </div>
            <a className="product-preview" href={product.url} target="_blank" rel="noreferrer" aria-label={`Open ${product.name}`}><img src={product.preview} width="860" height="548" alt={`${product.name} job search interface`} /></a>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
