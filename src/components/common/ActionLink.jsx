import { scrollToSection } from "../../utils/scrollToSection";

export function ActionLink({ children, to, href, className = "" }) {
  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={className}
      type="button"
      onClick={() => scrollToSection(to)}
    >
      {children}
    </button>
  );
}
