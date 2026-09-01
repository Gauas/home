export const MOTION = Object.freeze({
  FAST: 240,
  BASE: 520,
  SLOW: 820,
  INTRO: 1520,
  STAGGER: 54,
  EASE_OUT: "out(4)",
  EASE_IN_OUT: "inOut(3)",
  SPRING: "outElastic(1, .55)",
});

export const MOTION_MEDIA = Object.freeze({
  desktop: "(min-width: 72rem) and (hover: hover) and (pointer: fine)",
  tablet: "(min-width: 40rem) and (max-width: 71.999rem)",
  mobile: "(max-width: 39.999rem)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
});

