export function SelectedWork() {
  return (
    <section className="selected-work selected-work-updating is-disabled" id="work" aria-disabled="true">
      <div className="container">
        <p className="eyebrow dark">SELECTED WORK</p>
        <div className="work-updating-row">
          <h2>Work archive<br />in progress.</h2>
          <div><p>Case studies will appear here when the details are accurate and ready to share.</p><span className="text-link" aria-disabled="true">View status <span aria-hidden="true">→</span></span></div>
        </div>
      </div>
    </section>
  );
}
