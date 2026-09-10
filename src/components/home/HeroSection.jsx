import { useEffect, useState } from "react";
import { ActionLink } from "../common/ActionLink";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function HeroSection({ translations }) {
  const [motionAllowed, setMotionAllowed] = useState(
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setMotionAllowed(!preference.matches);

    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return (
    <section className="hero" id="top">
      {motionAllowed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/new-hero-poster.webp"
          aria-hidden="true"
        >
          <source src="/video/gauas-hero-loop.webm" type="video/webm" />
          <source src="/video/gauas-hero-loop.mp4" type="video/mp4" />
        </video>
      )}
      <div className="hero-shade" />
      <div className="container hero-inner">
        <div className="hero-copy reveal">
          <p className="eyebrow">{translations.eyebrow}</p>
          <h1>{translations.title}</h1>
          <p>{translations.copy}</p>
          <div className="hero-actions">
            <ActionLink className="lime-button" to="solutions">
              {translations.primary}
            </ActionLink>
            <ActionLink className="outline-button" to="projects">
              {translations.secondary}
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
