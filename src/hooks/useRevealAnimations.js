import { useEffect } from "react";

export function useRevealAnimations(locale) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [locale]);
}
