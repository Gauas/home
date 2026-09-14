import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const directions = [
  {
    id: "quick-launch",
    label: "Quick launch",
    title: "Build and launch quickly.",
    copy: "A lean product foundation for validating the workflow, learning from users, and shipping without unnecessary infrastructure.",
    detail: "A focused release with room to evolve once the product has real usage.",
    technologyGroups: [
      { label: "Web application", items: [["Next.js", "/assets/logo/nextjs.svg"]] },
      { label: "Data & accounts", items: [["Prisma", "/assets/logo/prisma.svg"], ["Supabase", "/assets/logo/supabase.svg"]] },
    ],
  },
  {
    id: "scale",
    label: "Scale & reliability",
    title: "Operate with room to grow.",
    copy: "Clear services, durable data, messaging, orchestration, and observability for products that need dependable scale.",
    detail: "Architecture is introduced where the operating needs justify it—not as a default.",
    technologyGroups: [
      { label: "Backend services", items: [["Java", "/assets/logo/java.svg"], ["Go", "/assets/logo/golang.svg"]] },
      { label: "Scale & operations", items: [["Kubernetes", "/assets/logo/kubernetes.svg"], ["RabbitMQ", "/assets/logo/rabbitmq.svg"], ["Kafka", "/assets/logo/kafka.svg"], ["Grafana", "/assets/logo/grafana.svg"]] },
    ],
  },
  {
    id: "multiplatform",
    label: "Multiplatform",
    title: "One product across devices.",
    copy: "Connected mobile and web experiences, backed by shared APIs and a delivery workflow the team can maintain.",
    detail: "The product experience stays coherent while each surface does the job it needs to do.",
    technologyGroups: [
      { label: "Mobile & web", items: [["Flutter", "/assets/logo/flutter.svg"], ["Next.js", "/assets/logo/nextjs.svg"]] },
      { label: "Backend & data", items: [["Node.js", "/assets/logo/nodejs.svg"], ["MySQL", "/assets/logo/mysql.svg"]] },
    ],
  },
  {
    id: "cloud",
    label: "Launch on cloud",
    title: "Launch on the right cloud.",
    copy: "Deployment shaped around the workload, team constraints, operating cost, and services already in use.",
    detail: "The cloud should support the product and its team, not add an unnecessary operating burden.",
    technologyGroups: [
      { label: "Cloud platforms", items: [["AWS", "/assets/logo/aws.svg"], ["Google Cloud", "/assets/logo/gcp.svg"]] },
    ],
  },
];

export function CapabilitiesSection() {
  const [activeId, setActiveId] = useState(directions[0].id);
  const activeDirection = directions.find(({ id }) => id === activeId);

  return (
    <section className="goal-stack-section">
      <div className="container">
        <header className="goal-stack-heading">
          <p className="eyebrow dark">BUILD FOR WHAT COMES NEXT</p>
          <h2>Choose the right setup for where your product is going.</h2>
        </header>

        <div className="goal-card-grid" role="tablist" aria-label="Product delivery directions">
          {directions.map((direction) => (
            <button
              key={direction.id}
              className="goal-card"
              type="button"
              role="tab"
              aria-selected={direction.id === activeId}
              onClick={() => setActiveId(direction.id)}
            >
              <span className="goal-card-top"><span>{direction.label}</span></span>
              <span className="goal-card-title">{direction.title}</span>
              <span className="goal-card-copy">{direction.copy}</span>
              <span className="goal-card-technology" aria-label={`${direction.label} technology examples`}>
                {direction.technologyGroups.map((group) => (
                  <span className="goal-tech-group" key={group.label}>
                    <span className="goal-tech-list">
                      {group.items.map(([name, src]) => <span className="goal-tech" key={name}><img src={src} alt="" width="34" height="34" /><span>{name}</span></span>)}
                    </span>
                  </span>
                ))}
              </span>
              <span className="goal-card-arrow"><ArrowUpRight aria-hidden="true" size={24} strokeWidth={1.7} /></span>
            </button>
          ))}
        </div>

        <div className="goal-card-note" role="tabpanel">
          <span>{activeDirection.label}</span>
          <p>{activeDirection.detail}</p>
        </div>
      </div>
    </section>
  );
}
