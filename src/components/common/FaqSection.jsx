export function FaqSection({ items }) {
  return (
    <section className="faq-section container">
      <div><p className="eyebrow dark">FAQ</p><h2>Questions, answered clearly.</h2></div>
      <div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
    </section>
  );
}
