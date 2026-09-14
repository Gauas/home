import { Link } from "react-router-dom";
import { PageShell } from "./PageShell";

export function NotFoundPage() {
  return <PageShell className="not-found"><section className="container"><p className="eyebrow dark">404</p><h1>This page isn’t here.</h1><p>The link may have moved, or the page may no longer exist.</p><Link className="lime-button" to="/">Return home</Link></section></PageShell>;
}
