import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToSection } from "../utils/scrollToSection";

export function useSectionNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback((sectionId) => {
    if (pathname === "/") {
      scrollToSection(sectionId);
      return;
    }

    navigate("/", { state: { scrollTarget: sectionId } });
  }, [navigate, pathname]);
}
