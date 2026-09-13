import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTopOnNavigation() {
  const { key, pathname } = useLocation();

  useLayoutEffect(() => {
    // Home-page navigation deliberately scrolls to a named section instead.
    if (pathname === "/") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [key, pathname]);
}
