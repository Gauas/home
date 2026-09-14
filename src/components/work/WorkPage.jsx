import { PageShell } from "../common/PageShell";
import { FinalCta } from "../common/FinalCta";

export function WorkPage() {
  return (
    <PageShell className="work-page">
      <section className="page-hero dark-page-hero"><div className="container"><p className="eyebrow">SELECTED WORK</p><h1>Work built<br />to be used.</h1><p>Selected digital products, systems, and experiences built by GAUAS.</p></div></section>
      <section className="work-status-band"><div className="container"><div><p className="eyebrow dark">WORK ARCHIVE</p><h2>Currently updating.</h2></div><p>Project case studies will be published only when their scope, technical details, and client information are ready to share.</p></div></section>
      <FinalCta />
    </PageShell>
  );
}
