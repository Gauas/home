import { GauasLogo } from "../GauasLogo";
import { scrollToSection } from "../../utils/scrollToSection";

export function BrandButton({ label, onClick, light = false }) {
  return (
    <button
      className="brand"
      type="button"
      onClick={onClick || (() => scrollToSection("top"))}
      aria-label={`GAUAS — ${label}`}
    >
      <GauasLogo light={light} />
    </button>
  );
}
