import { useSectionNavigation } from "../../hooks/useSectionNavigation";
import { useContactModal } from "../contact/ContactModal";

export function ActionLink({ children, to, href, className = "" }) {
  const { openContactModal } = useContactModal();
  const navigateToSection = useSectionNavigation();
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
      onClick={to === "contact" ? openContactModal : () => navigateToSection(to)}
    >
      {children}
    </button>
  );
}
