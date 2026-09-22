import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";
import { ActionLink } from "../common/ActionLink";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const panels = [
  { kicker: "01 / Digital foundations", title: "Make your next move\\nfeel inevitable.", copy: "Strategy, product and technology for teams building what comes next.", label: "Discover GAUAS", to: "about", tone: "lime", graphic: "orbit" },
  { kicker: "02 / Web experiences", title: "A website is a living\\npoint of view.", copy: "Distinctive digital spaces that turn a first visit into a lasting impression.", label: "Explore web projects", to: "/website", tone: "blue", graphic: "grid" },
  { kicker: "03 / Mobile products", title: "Useful enough\\nto become a habit.", copy: "Mobile products shaped around the tiny moments people come back to every day.", label: "Build an app", to: "/mobile-application", tone: "coral", graphic: "phone" },
  { kicker: "04 / Intelligent systems", title: "Give ambitious ideas\\na second brain.", copy: "Practical AI integrations that move your business forward, one smarter workflow at a time.", label: "Meet AI integration", to: "/ai-integration", tone: "violet", graphic: "signal" },
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );
  const lock = useRef(false);
  const touchStart = useRef(null);

  const move = (direction) => {
    if (lock.current) return;
    lock.current = true;
    setActive((current) => (current + direction + panels.length) % panels.length);
    window.setTimeout(() => { lock.current = false; }, 720);
  };

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setMotionAllowed(!preference.matches);

    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!motionAllowed) return undefined;
    const timer = window.setInterval(() => move(1), 6500);
    return () => window.clearInterval(timer);
  }, [motionAllowed]);

  const onWheel = (event) => {
    if (Math.abs(event.deltaY) < 12) return;
    event.preventDefault();
    move(event.deltaY > 0 ? 1 : -1);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
  };

  return (
    <section className="hero loop-hero" id="top" aria-label="Featured capabilities" tabIndex="0" onWheel={onWheel} onKeyDown={onKeyDown} onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientY; }} onTouchEnd={(event) => { const distance = touchStart.current - event.changedTouches[0].clientY; if (Math.abs(distance) > 35) move(distance > 0 ? 1 : -1); }}>
      <div className="loop-hero-track" style={{ transform: `translateY(-${active * 100}%)` }}>
        {panels.map((panel, index) => (
          <article className={`loop-panel ${panel.tone}`} key={panel.kicker} aria-hidden={active !== index}>
            <div className="loop-panel-noise" />
            <div className={`loop-art ${panel.graphic}`} aria-hidden="true"><i /><i /><i /><i /><b>GAUAS</b></div>
            <div className="container loop-panel-inner">
              <div className="loop-copy"><p className="loop-kicker">{panel.kicker}</p><h1>{panel.title}</h1><p>{panel.copy}</p><ActionLink className="loop-action" to={panel.to} tabIndex={active === index ? 0 : -1}>{panel.label} <ArrowUpRight size={17} strokeWidth={1.8} /></ActionLink></div>
              <p className="loop-index">0{index + 1}<span> / 0{panels.length}</span></p>
            </div>
          </article>
        ))}
      </div>
      <div className="loop-controls" aria-label="Panel controls"><button type="button" onClick={() => move(-1)} aria-label="Previous panel"><ArrowUp size={18} /></button><div className="loop-dots">{panels.map((panel, index) => <button key={panel.kicker} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={`Go to panel ${index + 1}`} aria-current={active === index ? "true" : undefined} />)}</div><button type="button" onClick={() => move(1)} aria-label="Next panel"><ArrowDown size={18} /></button></div>
      <p className="loop-hint"><span>Scroll to explore</span><ArrowDown size={14} /></p>
    </section>
  );
}
