import { Link } from "react-router-dom";

export function SelectedWork() {
  return (
    <section className="selected-work selected-work-updating" id="work">
      <div className="container">
        <p className="eyebrow dark">SELECTED WORK</p>
        <div className="work-updating-row">
          <h2>Work archive<br />in progress.</h2>
          <div><p>Case studies will appear here when the details are accurate and ready to share.</p><Link className="text-link" to="/work">View status <span aria-hidden="true">→</span></Link></div>
        </div>
      </div>
    </section>
  );
}
