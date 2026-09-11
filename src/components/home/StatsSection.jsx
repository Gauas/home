import { CountUpValue } from "../common/CountUpValue";

export function StatsSection({ statistics }) {
  return (
    <section className="stats-section" id="about">
      <div className="container">
        <div className="stats">
          <div className="stats-label">
            <p className="eyebrow dark">{statistics.eyebrow}</p>
            <h2>{statistics.title}</h2>
          </div>
          {statistics.items.map(({ value, suffix, label }) => (
            <div key={label}>
              <CountUpValue value={value} suffix={suffix} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
