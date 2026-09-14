import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTopOnNavigation() {
  const { key, pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [key, pathname]);
}
