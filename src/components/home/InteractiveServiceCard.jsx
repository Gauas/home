import { useRef } from "react";

export function InteractiveServiceCard({ title, copy, index, isActive, onSelect }) {
  const cardRef = useRef(null);

  const updatePointer = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty("--pointer-x", `${x * 100}%`);
    card.style.setProperty("--pointer-y", `${y * 100}%`);
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 3}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 3}deg`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--pointer-x", "50%");
    card.style.setProperty("--pointer-y", "50%");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <button
      className={`service-card service-card-${index}${isActive ? " is-active" : ""}`}
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      aria-label={`Start a ${title} project inquiry`}
      aria-haspopup="dialog"
      aria-expanded={isActive}
    >
      <h3>{title}</h3>
      <p>{copy}</p>
    </button>
  );
}
