export const CONTACT_EMAIL = "contact@gauas.com";
export const SITE_URL = "https://www.gauas.com";
export const RESOURCE_ORIGIN = "https://resource.gauas.com/gauas";
export const HERO_VIDEO_SOURCES = {
  webm: `${RESOURCE_ORIGIN}/hero.webm`,
  mp4: `${RESOURCE_ORIGIN}/hero.mp4`,
};
export const AI_HERO_VIDEO = `${RESOURCE_ORIGIN}/ai_hero.mp4`;

export const PRIMARY_NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Services", href: "/#services", dropdown: true },
  { label: "About", href: "/about" },
];

export const SERVICES = [
  { label: "Web Development", href: "/website", description: "Websites and production web applications." },
  { label: "Mobile Applications", href: "/mobile-application", description: "Focused mobile products for iOS and Android." },
  { label: "AI Integration", href: "/ai-integration", description: "Useful AI connected to real workflows." },
  { label: "Internal Tools", href: "/tools", description: "Software shaped around how teams work." },
];

export const PUBLIC_ROUTES = [
  "/",
  "/product",
  "/about",
  ...SERVICES.map(({ href }) => href),
  "/support",
  "/privacy",
  "/terms",
  "/cookies",
];
