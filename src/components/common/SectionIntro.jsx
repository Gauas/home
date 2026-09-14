export function SectionIntro({ eyebrow, title, copy, light = false }) {
  return (
    <header className={`section-intro ${light ? "light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </header>
  );
}
