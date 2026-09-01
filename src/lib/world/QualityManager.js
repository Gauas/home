export function getQualityProfile() {
  const mobile = window.matchMedia("(max-width: 47.999rem)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const low = memory <= 2 || cores <= 4;
  const medium = mobile || memory <= 4 || cores <= 6;

  if (reducedMotion || low) {
    return { name: "LOW", dpr: 1, particles: 700, antialias: false, shadows: false, mobile, reducedMotion };
  }
  if (medium) {
    return { name: "MEDIUM", dpr: 1.2, particles: 1300, antialias: true, shadows: false, mobile, reducedMotion };
  }
  return { name: "HIGH", dpr: 1.5, particles: 2200, antialias: true, shadows: true, mobile, reducedMotion };
}

