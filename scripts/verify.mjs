import puppeteer from "puppeteer-core";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5173 },
  logLevel: "error",
});
await server.listen();

const baseUrl = server.resolvedUrls?.local?.[0] ?? "http://127.0.0.1:5173/";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--enable-unsafe-swiftshader"],
});

const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const watchRuntime = (page) => {
  const errors = [];
  const consoleProblems = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || /No target found|deprecated/i.test(message.text())) {
      consoleProblems.push(message.text());
    }
  });
  return { errors, consoleProblems };
};

const results = [];
try {
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 768, height: 900 },
    { width: 960, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    const page = await browser.newPage();
    const diagnostics = watchRuntime(page);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(baseUrl, { waitUntil: "networkidle0" });
    await page.waitForSelector(".world-canvas canvas");
    await pause(1200);

    const initial = await page.evaluate(() => {
      const isVisible = (element) => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && Number.parseFloat(style.opacity) > 0
          && rect.width > 0
          && rect.height > 0;
      };
      const heroCopy = document.querySelector(".launch__copy")?.getBoundingClientRect();
      const heroCta = document.querySelector(".primary-cta")?.getBoundingClientRect();
      const nav = document.querySelector(".world-nav")?.getBoundingClientRect();
      const heroTitle = document.querySelector("#launch-title")?.getBoundingClientRect();
      const canvas = document.querySelector(".world-canvas canvas");
      const sectionIds = [...document.querySelectorAll("main .world-scene")].map((section) => section.id);
      return {
        sectionIds,
        headings: document.querySelectorAll("main h1, main h2").length,
        h1s: document.querySelectorAll("main h1").length,
        h2s: document.querySelectorAll("main h2").length,
        mainButtons: document.querySelectorAll("main button").length,
        canvas: { width: canvas?.width ?? 0, height: canvas?.height ?? 0 },
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        heroTitleVisible: isVisible(document.querySelector("#launch-title")),
        heroCopyVisible: isVisible(document.querySelector(".launch__copy")),
        heroCtaVisible: isVisible(document.querySelector(".primary-cta")),
        heroContentFits: Boolean(nav && heroTitle && heroCopy && heroCta)
          && heroTitle.top >= nav.bottom - 1
          && heroCopy.bottom <= innerHeight + 1
          && heroCta.bottom <= innerHeight + 1,
        heroBounds: {
          navBottom: Math.round(nav?.bottom ?? 0),
          titleTop: Math.round(heroTitle?.top ?? 0),
          copyBottom: Math.round(heroCopy?.bottom ?? 0),
          ctaBottom: Math.round(heroCta?.bottom ?? 0),
          viewportBottom: innerHeight,
        },
        brandVisible: isVisible(document.querySelector(".world-nav__brand")),
        fallback: document.documentElement.classList.contains("world-fallback"),
        navFontSize: Number.parseFloat(getComputedStyle(document.querySelector(".world-nav__links a")).fontSize),
        bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize),
      };
    });

    let mobileMenu = null;
    if (width <= 768) {
      await page.click(".menu-toggle");
      await page.waitForFunction(() => document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "true");
      await pause(100);
      mobileMenu = await page.evaluate(() => {
        const toggle = document.querySelector(".menu-toggle");
        const nav = document.querySelector(".world-nav__links");
        const glass = document.querySelector(".world-nav__inner");
        const links = [...nav.querySelectorAll("a")];
        const navStyle = getComputedStyle(nav);
        const glassStyle = getComputedStyle(glass);
        const glassFilter = glassStyle.backdropFilter || glassStyle.webkitBackdropFilter || "";
        const targets = [toggle, ...links].map((element) => element.getBoundingClientRect());
        return {
          expanded: toggle.getAttribute("aria-expanded") === "true",
          controlsMenu: toggle.getAttribute("aria-controls") === nav.id,
          visible: navStyle.display !== "none"
            && navStyle.visibility === "visible"
            && Number.parseFloat(navStyle.opacity) > 0
            && nav.getBoundingClientRect().height > 0,
          glassTreatment: /blur\(/i.test(glassFilter),
          labeled: links.length === 5 && links.every((link) => link.textContent.trim().length > 0),
          touchTargets: targets.every((rect) => rect.width >= 44 && rect.height >= 44),
          bodyLocked: document.body.style.overflow === "hidden",
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        };
      });

      await page.evaluate(() => document.querySelector(".world-nav__links a:last-child")?.focus());
      await page.keyboard.press("Tab");
      mobileMenu.focusTrapped = await page.evaluate(() => (
        document.activeElement === document.querySelector(".world-nav__links a:first-child")
      ));
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "false");
      await pause(50);
      Object.assign(mobileMenu, await page.evaluate(() => ({
        focusRestored: document.activeElement === document.querySelector(".menu-toggle"),
        overflowUnlocked: document.body.style.overflow !== "hidden",
        mainUnlocked: !document.querySelector("#main-content")?.hasAttribute("inert"),
      })));
    }

    await page.evaluate(() => document.querySelector("#work")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForFunction(() => document.querySelector(".work-feature img")?.complete);
    await pause(350);
    const work = await page.evaluate(() => {
      const projectLinks = [...document.querySelectorAll("#work .work-showcase a[href^='mailto:']")];
      const featuredImage = document.querySelector(".work-feature img");
      const visible = (selector) => {
        const element = document.querySelector(selector);
        return Boolean(element)
          && Number.parseFloat(getComputedStyle(element).opacity) > 0
          && element.getBoundingClientRect().height > 0;
      };
      return {
        projectMailtoLinks: projectLinks.length,
        allProjectLinksAddressed: projectLinks.every((link) => /^mailto:tnqb\.job106204@gmail\.com\?/i.test(link.getAttribute("href"))),
        featuredImageCount: document.querySelectorAll(".work-feature img").length,
        featuredImageAlt: featuredImage?.getAttribute("alt")?.trim() ?? "",
        featuredImageLoaded: Boolean(featuredImage?.complete && featuredImage.naturalWidth > 0),
        indexedProjects: document.querySelectorAll(".work-index > li").length,
        contentVisible: ["#work-title", "#work .scene__copy", ".work-showcase"].every(visible),
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      };
    });

    await page.evaluate(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await pause(350);
    const contact = await page.evaluate(() => {
      const cta = document.querySelector(".contact__cta");
      const rect = cta?.getBoundingClientRect();
      return {
        ctaVisible: Boolean(rect?.width && rect?.height) && Number.parseFloat(getComputedStyle(cta).opacity) > 0,
        emailHref: cta?.getAttribute("href") ?? "",
        emailText: cta?.textContent.trim() ?? "",
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      };
    });

    results.push({ width, height, initial, mobileMenu, work, contact, ...diagnostics });
    await page.close();
  }

  const reducedPage = await browser.newPage();
  const reducedDiagnostics = watchRuntime(reducedPage);
  await reducedPage.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await reducedPage.goto(baseUrl, { waitUntil: "networkidle0" });
  await reducedPage.waitForSelector(".world-canvas canvas");
  await pause(350);
  const reducedMotion = await reducedPage.evaluate(() => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none"
        && style.visibility !== "hidden"
        && Number.parseFloat(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    };
    const selectors = [
      ".launch__title",
      ".launch__copy",
      ".primary-cta",
      ".services-list",
      ".work-showcase",
      ".engineering-facts",
      ".process-list",
      ".contact__cta",
    ];
    return {
      preferenceApplied: matchMedia("(prefers-reduced-motion: reduce)").matches,
      heroVisible: [".launch__title", ".launch__copy", ".primary-cta"]
        .every((selector) => visible(document.querySelector(selector))),
      contentVisible: selectors.every((selector) => visible(document.querySelector(selector)))
        && [...document.querySelectorAll(".scene__title, .scene__copy")].every(visible),
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    };
  });
  await reducedPage.close();

  const resizePage = await browser.newPage();
  const resizeDiagnostics = watchRuntime(resizePage);
  await resizePage.setViewport({ width: 375, height: 700, deviceScaleFactor: 1 });
  await resizePage.goto(baseUrl, { waitUntil: "networkidle0" });
  await resizePage.click(".menu-toggle");
  await resizePage.waitForFunction(() => document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "true");
  await resizePage.setViewport({ width: 1000, height: 700, deviceScaleFactor: 1 });
  await resizePage.waitForFunction(() => document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "false");
  await pause(50);
  const resizeCleanup = await resizePage.evaluate(() => {
    const nav = document.querySelector(".world-nav__links");
    return {
      menuClosed: document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false",
      scrollUnlocked: document.body.style.overflow !== "hidden",
      mainUnlocked: !document.querySelector("#main-content")?.hasAttribute("inert"),
      desktopNavVisible: getComputedStyle(nav).display !== "none" && nav.getBoundingClientRect().height > 0,
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    };
  });
  await resizePage.close();

  const anchorPage = await browser.newPage();
  const anchorDiagnostics = watchRuntime(anchorPage);
  await anchorPage.setViewport({ width: 375, height: 568, deviceScaleFactor: 1 });
  await anchorPage.goto(baseUrl, { waitUntil: "networkidle0" });
  await anchorPage.waitForSelector(".world-canvas canvas");
  const anchorChecks = [];
  for (const href of ["#services", "#work", "#engineering", "#process", "#contact"]) {
    await anchorPage.click(".menu-toggle");
    await anchorPage.waitForFunction(() => document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "true");
    await anchorPage.click(`#primary-navigation a[href="${href}"]`);
    await anchorPage.waitForFunction(
      (selector) => location.hash === selector
        && document.querySelector(`#primary-navigation a[href="${selector}"]`)?.getAttribute("aria-current") === "page",
      { timeout: 5000 },
      href,
    );
    await pause(150);
    anchorChecks.push(await anchorPage.evaluate((selector) => {
      const section = document.querySelector(selector);
      const heading = section?.querySelector("h1, h2")?.getBoundingClientRect();
      const navLink = document.querySelector(`#primary-navigation a[href="${selector}"]`);
      return {
        href: selector,
        hashUpdated: location.hash === selector,
        current: navLink?.getAttribute("aria-current") === "page",
        singleCurrent: document.querySelectorAll("#primary-navigation a[aria-current='page']").length === 1,
        menuClosed: document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") === "false",
        scrollUnlocked: document.body.style.overflow !== "hidden",
        headingVisible: Boolean(heading && heading.bottom > 0 && heading.top < innerHeight),
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      };
    }, href));
  }
  await anchorPage.close();

  const requiredSections = ["launch", "services", "work", "engineering", "process", "contact"];
  const failed = results.some((result) => (
    result.errors.length > 0
    || result.consoleProblems.length > 0
    || result.initial.overflow
    || JSON.stringify(result.initial.sectionIds) !== JSON.stringify(requiredSections)
    || result.initial.headings !== 6
    || result.initial.h1s !== 1
    || result.initial.h2s !== 5
    || result.initial.mainButtons !== 0
    || result.initial.canvas.width <= 0
    || result.initial.canvas.height <= 0
    || result.initial.fallback
    || !result.initial.heroTitleVisible
    || !result.initial.heroCopyVisible
    || !result.initial.heroCtaVisible
    || !result.initial.heroContentFits
    || !result.initial.brandVisible
    || result.initial.bodyFontSize < 16
    || result.initial.navFontSize < 14
    || (result.mobileMenu && Object.values(result.mobileMenu).some((value) => !value))
    || result.work.projectMailtoLinks !== 3
    || !result.work.allProjectLinksAddressed
    || result.work.featuredImageCount !== 1
    || !result.work.featuredImageAlt
    || !result.work.featuredImageLoaded
    || result.work.indexedProjects !== 2
    || !result.work.contentVisible
    || !result.work.noOverflow
    || !result.contact.ctaVisible
    || !/^mailto:tnqb\.job106204@gmail\.com\?/i.test(result.contact.emailHref)
    || result.contact.emailText !== "tnqb.job106204@gmail.com"
    || !result.contact.noOverflow
  ))
    || !reducedMotion.preferenceApplied
    || !reducedMotion.heroVisible
    || !reducedMotion.contentVisible
    || !reducedMotion.noOverflow
    || reducedDiagnostics.errors.length > 0
    || reducedDiagnostics.consoleProblems.length > 0
    || !resizeCleanup.menuClosed
    || !resizeCleanup.scrollUnlocked
    || !resizeCleanup.mainUnlocked
    || !resizeCleanup.desktopNavVisible
    || !resizeCleanup.noOverflow
    || resizeDiagnostics.errors.length > 0
    || resizeDiagnostics.consoleProblems.length > 0
    || anchorChecks.some((check) => Object.values(check).some((value) => !value))
    || anchorDiagnostics.errors.length > 0
    || anchorDiagnostics.consoleProblems.length > 0;

  console.log(JSON.stringify({
    passed: !failed,
    baseUrl,
    results,
    reducedMotion: { ...reducedMotion, ...reducedDiagnostics },
    resizeCleanup: { ...resizeCleanup, ...resizeDiagnostics },
    anchorChecks,
    anchorDiagnostics,
  }, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
