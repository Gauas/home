import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--disable-gpu"],
});

const widths = [320, 375, 414, 768, 1536];
const results = [];

async function detectedLanguage(browserLanguage) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((language) => {
    window.localStorage.clear();
    Object.defineProperty(window.navigator, "language", { get: () => language });
    Object.defineProperty(window.navigator, "languages", { get: () => [language] });
  }, browserLanguage);
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle0" });
  const detected = await page.evaluate(() => document.documentElement.lang);
  await page.close();
  return detected;
}

const i18n = {
  viBrowser: await detectedLanguage("vi-VN"),
  enBrowser: await detectedLanguage("en-US"),
  unsupportedBrowserFallsBackTo: await detectedLanguage("fr-FR"),
};

async function measureLayout(page) {
  return page.evaluate(() => {
    const selectors = [".hero", ".proof-strip", ".services", ".work", ".process", ".process__layout", ".process__intro", ".process__steps", ".contact-card", ".site-footer"];
    return Object.fromEntries(selectors.map((selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return [selector, rect ? { top: Math.round(rect.top + window.scrollY), height: Math.round(rect.height) } : null];
    }));
  });
}

for (const width of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle0" });
  await page.evaluate(() => window.localStorage.setItem("gauas-language", "vi"));
  await page.reload({ waitUntil: "networkidle0" });

  const initial = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    lazyLoadedAtTop: [...document.querySelectorAll('.project-card img')].filter((img) => img.complete && img.naturalWidth > 0).length,
  }));
  const layoutVi = await measureLayout(page);

  await page.evaluate(() => window.localStorage.setItem("gauas-language", "en"));
  await page.reload({ waitUntil: "networkidle0" });
  const layoutEn = await measureLayout(page);
  const languageShift = Object.fromEntries(Object.keys(layoutVi).map((selector) => [selector, {
    top: Math.abs(layoutVi[selector].top - layoutEn[selector].top),
    height: Math.abs(layoutVi[selector].height - layoutEn[selector].height),
  }]));

  await page.evaluate(() => window.localStorage.setItem("gauas-language", "vi"));
  await page.reload({ waitUntil: "networkidle0" });

  if (width === 375) await page.screenshot({ path: "verification-mobile-vi-top.png", fullPage: false });

  let contact;
  if (width === 320 || width === 375 || width === 1536) {
    await page.click(".contact-trigger");
    await new Promise((resolve) => setTimeout(resolve, 300));
    contact = await page.evaluate(() => {
      const panel = document.querySelector(".contact-panel");
      const panelRect = panel.getBoundingClientRect();
      return {
        expanded: document.querySelector(".contact-trigger")?.getAttribute("aria-expanded"),
        visible: getComputedStyle(panel).visibility,
        withinViewport: panelRect.top >= 0 && panelRect.left >= 0 && panelRect.right <= document.documentElement.clientWidth && panelRect.bottom <= window.innerHeight,
        links: [...panel.querySelectorAll("a")].map((link) => link.getAttribute("href")),
      };
    });
    if (width === 375) await page.screenshot({ path: "verification-mobile-contact.png", fullPage: false });
    await page.click(".contact-trigger");
  }

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector('a[href="#process"]')?.click();
  });
  const anchor = await page.evaluate(() => ({
    headerHeight: Math.round(document.querySelector(".site-nav").getBoundingClientRect().height),
    processTop: Math.round(document.querySelector("#process").getBoundingClientRect().top),
  }));

  if (width === 375) {
    await page.screenshot({ path: "verification-mobile-process.png", fullPage: false });
    await page.evaluate(() => document.querySelector(".proof-strip")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.screenshot({ path: "verification-mobile-sectors.png", fullPage: false });
  }

  if (width === 1536) {
    await page.evaluate(() => document.querySelector(".proof-strip")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.screenshot({ path: "verification-desktop-sectors.png", fullPage: false });
  }

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#work")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForFunction(() => [...document.querySelectorAll('.project-card img')].every((img) => img.complete && img.naturalWidth > 0));
  await page.waitForFunction(() => document.querySelector("#work")?.classList.contains("is-visible"));
  await page.evaluate(() => Promise.all([...document.querySelectorAll('.project-card img')].map((img) => img.decode())));

  const afterScroll = await page.evaluate(() => {
    const affordances = [...document.querySelectorAll(".button, .nav-cta, .site-nav__links a, .arrow-link, .site-footer nav a, .contact-trigger, .contact-panel a")];
    return {
      language: document.documentElement.lang,
      projectImagesLoaded: [...document.querySelectorAll('.project-card img')].filter((img) => img.complete && img.naturalWidth > 0).length,
      workRevealed: document.querySelector("#work")?.classList.contains("is-visible"),
      wrappedAffordances: affordances.filter((node) => {
        const styles = getComputedStyle(node);
        return styles.display !== "none" && styles.visibility !== "hidden" && styles.whiteSpace !== "nowrap";
      }).map((node) => node.textContent.trim()),
    };
  });

  if (width === 375) {
    await page.screenshot({ path: "verification-mobile-work.png", fullPage: false });
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.click(".menu-toggle");
    afterScroll.mobileMenu = await page.evaluate(() => ({
      expanded: document.querySelector(".menu-toggle")?.getAttribute("aria-expanded"),
      visible: getComputedStyle(document.querySelector(".mobile-menu")).visibility,
    }));
  }

  if (width === 1536) {
    await page.screenshot({ path: "verification-desktop-work.png", fullPage: false });
  }

  results.push({ width, ...initial, languageShift, contact, anchor, ...afterScroll });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ i18n, viewports: results }, null, 2));
