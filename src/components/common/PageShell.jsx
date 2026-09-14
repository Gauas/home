import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";

export function PageShell({ children, className = "" }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header solid />
      <main className={className} id="main">{children}</main>
      <Footer />
    </>
  );
}
