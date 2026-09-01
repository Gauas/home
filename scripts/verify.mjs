import puppeteer from "puppeteer-core";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 5173 },
  logLevel: "error",
});
await server.listen();

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl"],
});

const results = [];
try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle0" });
    await page.waitForSelector(".world-canvas canvas");
    await new Promise((resolve) => setTimeout(resolve, 1700));

    const initial = await page.evaluate(() => ({
      sections: document.querySelectorAll(".world-scene").length,
      headings: document.querySelectorAll("h1, h2").length,
      canvas: {
        width: document.querySelector(".world-canvas canvas")?.width,
        height: document.querySelector(".world-canvas canvas")?.height,
      },
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      logoVisible: getComputedStyle(document.querySelector(".intro__logo")).opacity === "1",
      fallback: document.documentElement.classList.contains("world-fallback"),
    }));

    await page.evaluate(() => document.querySelector("#templates")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await new Promise((resolve) => setTimeout(resolve, 800));
    const productState = await page.$eval(".world-state__name", (element) => element.textContent);

    await page.evaluate(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await new Promise((resolve) => setTimeout(resolve, 800));
    const contact = await page.evaluate(() => ({
      state: document.querySelector(".world-state__name")?.textContent,
      ctaVisible: Boolean(document.querySelector(".contact__cta")?.getBoundingClientRect().width),
      email: document.querySelector(".contact__cta")?.getAttribute("href"),
    }));

    results.push({ width, initial, productState, contact, errors });
    await page.close();
  }

  const reducedPage = await browser.newPage();
  await reducedPage.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await reducedPage.goto("http://127.0.0.1:5173", { waitUntil: "networkidle0" });
  await new Promise((resolve) => setTimeout(resolve, 400));
  const reducedMotion = await reducedPage.evaluate(() => ({
    logoVisible: getComputedStyle(document.querySelector(".intro__logo")).opacity === "1",
    contentVisible: [...document.querySelectorAll(".scene__title")].every((element) => getComputedStyle(element).opacity !== "0"),
  }));
  await reducedPage.close();

  const failed = results.some((result) => result.errors.length || result.initial.overflow || result.initial.sections !== 6 || result.initial.fallback || !result.contact.ctaVisible) || !reducedMotion.logoVisible || !reducedMotion.contentVisible;
  console.log(JSON.stringify({ passed: !failed, results, reducedMotion }, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
