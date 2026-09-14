import { useSectionNavigation } from "../../hooks/useSectionNavigation";
import { useContactModal } from "../contact/ContactModal";
import { Link } from "react-router-dom";

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

  if (to?.startsWith("/")) return <Link className={className} to={to}>{children}</Link>;

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
