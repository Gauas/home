import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function SectionLoop({ children }) {
  const panels = Array.isArray(children) ? children : [children];
  const [active, setActive] = useState(0);
  const locked = useRef(false);
  const touchStart = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  const move = (direction) => {
    if (locked.current) return;
    locked.current = true;
    setActive((current) => (current + direction + panels.length) % panels.length);
    window.setTimeout(() => { locked.current = false; }, reducedMotion ? 0 : 700);
  };

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <section
      className={`section-loop${reducedMotion ? " reduced-motion" : ""}`}
      aria-label="Home page sections"
      tabIndex="0"
      onKeyDown={(event) => {
        if (["ArrowDown", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(1); }
        if (["ArrowUp", "ArrowLeft"].includes(event.key)) { event.preventDefault(); move(-1); }
      }}
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 12) return;
        const panel = event.target.closest(".section-loop-panel");
        if (panel) {
          const canScroll = panel.scrollHeight > panel.clientHeight + 1;
          const atStart = panel.scrollTop <= 1;
          const atEnd = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
          if (canScroll && ((event.deltaY > 0 && !atEnd) || (event.deltaY < 0 && !atStart))) return;
        }
        event.preventDefault();
        move(event.deltaY > 0 ? 1 : -1);
      }}
      onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientY; }}
      onTouchEnd={(event) => {
        const delta = touchStart.current - event.changedTouches[0].clientY;
        if (Math.abs(delta) > 35) move(delta > 0 ? 1 : -1);
      }}
    >
      <div className="section-loop-track" style={{ transform: `translateY(-${active * 100}%)` }}>
        {panels.map((panel, index) => <article className="section-loop-panel" aria-hidden={active !== index} key={panel.key || index}>{panel}</article>)}
      </div>
      <div className="section-loop-controls" aria-label="Section navigation">
        <button type="button" onClick={() => move(-1)} aria-label="Previous section"><ArrowUp size={17} /></button>
        <div>{panels.map((panel, index) => <button type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Go to section ${index + 1}`} aria-current={index === active ? "true" : undefined} key={panel.key || index} />)}</div>
        <button type="button" onClick={() => move(1)} aria-label="Next section"><ArrowDown size={17} /></button>
      </div>
    </section>
  );
}
