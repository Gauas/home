import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PAGE_METADATA } from "../src/config/metadata.js";

const origin = "https://www.gauas.com";
const baseHtml = await readFile("dist/index.html", "utf8");

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

for (const [route, { title, description }] of Object.entries(PAGE_METADATA)) {
  const url = `${origin}${route === "/" ? "" : route}`;
  const html = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  const output = route === "/" ? "dist/index.html" : join("dist", route.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

await mkdir("dist/privacy-policy", { recursive: true });
await writeFile("dist/privacy-policy/index.html", await readFile("dist/privacy/index.html", "utf8"));

const notFoundHtml = baseHtml
  .replace(/<title>.*?<\/title>/, "<title>Page Not Found | GAUAS</title>")
  .replace(/<meta name="description" content=".*?"\s*\/?>/, '<meta name="description" content="The page you requested could not be found." />')
  .replace(/<meta name="robots" content=".*?"\s*\/?>/, '<meta name="robots" content="noindex,follow" />')
  .replace(/<link rel="canonical" href=".*?"\s*\/?>/, '<link rel="canonical" href="https://www.gauas.com/404" />');
await writeFile("dist/404.html", notFoundHtml);
