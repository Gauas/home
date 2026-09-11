import { useNavigate } from "react-router-dom";
import { CONTACT_EMAIL } from "../../config/site";

const footerGroups = [["Products", "Infrastructure", "Work"], ["Docs", "Blog", "About"]];

export function LegalFooter() {
  const navigate = useNavigate();
  return <footer className="privacy-footer"><div className="privacy-footer-grid">
    <div className="privacy-footer-brand"><img src="/assets/footer_logo.png" alt="GAUAS" /><p>Simple infrastructure<br />for thoughtful builders.</p></div>
    {footerGroups.map((group) => <nav aria-label={`${group[0]} links`} key={group[0]}>{group.map((item) => <button type="button" onClick={() => navigate("/")} key={item}>{item}</button>)}</nav>)}
    <nav aria-label="Contact links"><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a><span>GitHub</span><span>LinkedIn</span></nav>
    <div className="privacy-footer-legal"><p>© 2026 GAUAS. All rights reserved.</p><span><button type="button" onClick={() => navigate("/privacy")}>Privacy</button><button type="button" onClick={() => navigate("/terms")}>Terms</button><button type="button" onClick={() => navigate("/cookies")}>Cookies</button></span></div>
  </div></footer>;
}
