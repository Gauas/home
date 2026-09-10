import { GauasLogo } from "../GauasLogo";
import { scrollToSection } from "../../utils/scrollToSection";

export function BrandButton({ label }) {
  return (
    <button
      className="brand"
      type="button"
      onClick={() => scrollToSection("top")}
      aria-label={`GAUAS — ${label}`}
    >
      <GauasLogo />
    </button>
  );
}
