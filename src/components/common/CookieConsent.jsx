import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "gauas-cookie-consent";

function getStoredConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return "unavailable";
  }
}

export function CookieConsent() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(() => !getStoredConsent());
  const [isManaging, setIsManaging] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const saveConsent = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } finally {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <section className="cookie-consent" aria-label="Cookie settings" role="dialog" aria-modal="false">
      <button className="cookie-close" type="button" aria-label="Reject non-essential cookies" onClick={() => saveConsent("essential")}> <X strokeWidth={1.5} /> </button>
      <div className="cookie-copy">
        <p className="cookie-eyebrow">COOKIE SETTINGS</p>
        <h2>We use cookies</h2>
        <p>We use essential cookies to make our site work properly, and analytics cookies to understand how you use Gauas and improve your experience. You can choose which cookies to allow. Read our <button type="button" onClick={() => navigate("/cookies")}>Cookie Policy</button>.</p>
      </div>
      {isManaging && (
        <div className="cookie-preferences">
          <div><strong>Essential cookies</strong><span>Always on</span></div>
          <label><span><strong>Analytics cookies</strong><small>Help us understand site performance.</small></span><input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} /></label>
        </div>
      )}
      <div className="cookie-actions">
        <button className="cookie-accept" type="button" onClick={() => saveConsent("all")}>Accept all</button>
        <button className="cookie-reject" type="button" onClick={() => saveConsent("essential")}>Reject non-essential</button>
        <button className="cookie-manage" type="button" onClick={() => isManaging ? saveConsent(analyticsEnabled ? "analytics" : "essential") : setIsManaging(true)}>{isManaging ? "Save preferences" : "Manage preferences"}</button>
      </div>
    </section>
  );
}
