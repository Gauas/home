import puppeteer from "puppeteer-core";
import { createServer } from "vite";
import { PAGE_METADATA } from "../src/config/metadata.js";

const server = await createServer({ server: { host: "127.0.0.1", port: 5173 }, logLevel: "error" });
await server.listen();
const baseUrl = server.resolvedUrls?.local?.[0] ?? "http://127.0.0.1:5173/";
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/home/tnqbao/.local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const routes = Object.keys(PAGE_METADATA);
const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const results = [];

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await page.evaluateOnNewDocument(() => localStorage.setItem("gauas-cookie-consent", "essential"));
      await page.goto(new URL(route, baseUrl), { waitUntil: "networkidle0" });
      const check = await page.evaluate(({ expected, route }) => {
        const canonical = document.querySelector('link[rel="canonical"]')?.href;
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content;
        const expectedUrl = `https://www.gauas.com${route === "/" ? "" : route}`;
        const internalLinks = [...document.querySelectorAll('a[href^="/"]')].map((link) => link.getAttribute("href"));
        return {
          route,
          title: document.title === expected.title,
          description: document.querySelector('meta[name="description"]')?.content === expected.description,
          canonical: canonical === expectedUrl || canonical === `${expectedUrl}/`,
          ogUrl: ogUrl === expectedUrl,
          h1: document.querySelectorAll("main h1").length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          emptyLinks: internalLinks.filter((href) => !href),
          missingImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
          lang: document.documentElement.lang,
        };
      }, { expected: PAGE_METADATA[route], route });
      results.push({ viewport: viewport.width, ...check, errors });
      if (route === "/" && [375, 768, 1440, 1920].includes(viewport.width)) await page.screenshot({ path: `/tmp/gauas-home-${viewport.width}.png`, fullPage: true });
      if ([375, 1440].includes(viewport.width) && ["/website", "/ai-integration", "/product", "/about"].includes(route)) await page.screenshot({ path: `/tmp/gauas-${route.slice(1)}-${viewport.width}.png`, fullPage: true });
      await page.close();
    }
  }

  const interactionPage = await browser.newPage();
  await interactionPage.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await interactionPage.evaluateOnNewDocument(() => localStorage.setItem("gauas-cookie-consent", "essential"));
  await interactionPage.goto(baseUrl, { waitUntil: "networkidle0" });
  await interactionPage.click(".menu-button");
  await new Promise((resolve) => setTimeout(resolve, 300));
  const mobileMenu = await interactionPage.evaluate(() => ({
    expanded: document.querySelector(".menu-button")?.getAttribute("aria-expanded") === "true",
    bodyLocked: document.body.style.overflow === "hidden",
    visible: getComputedStyle(document.querySelector(".mobile-nav")).visibility === "visible",
  }));
  await interactionPage.keyboard.press("Escape");
  await interactionPage.click(".header-actions .lime-button").catch(async () => {
    await interactionPage.click(".menu-button");
    await interactionPage.click(".mobile-nav .lime-button");
  });
  const contact = await interactionPage.evaluate(() => ({
    dialog: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    fields: ["contact-name", "contact-email", "contact-company", "contact-budget", "contact-message"].every((id) => Boolean(document.getElementById(id))),
    focused: document.activeElement?.id === "contact-name",
  }));
  await interactionPage.close();

  const failed = results.some((result) => !result.title || !result.description || !result.canonical || !result.ogUrl || result.h1 !== 1 || result.overflow || result.emptyLinks.length || result.missingImages.length || result.lang !== "en" || result.errors.length) || Object.values(mobileMenu).some((value) => !value) || Object.values(contact).some((value) => !value);
  console.log(JSON.stringify({ passed: !failed, checked: results.length, failures: results.filter((result) => !result.title || !result.description || !result.canonical || !result.ogUrl || result.h1 !== 1 || result.overflow || result.emptyLinks.length || result.missingImages.length || result.lang !== "en" || result.errors.length), mobileMenu, contact }, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
