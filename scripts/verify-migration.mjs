import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(root, ".migration", "jekyll-routes.json"), "utf8"),
);
const failures = [];

async function exists(relativePath) {
  try {
    await access(path.join(outputDirectory, relativePath));
    return true;
  } catch {
    return false;
  }
}

for (const route of manifest.canonicalFiles) {
  const relativePath = route.replace(/^\/+/, "");
  if (!(await exists(relativePath))) failures.push(`Missing page: ${route}`);
}

const redirectLines = (await readFile(path.join(outputDirectory, "_redirects"), "utf8"))
  .trim()
  .split(/\r?\n/);
const redirects = new Map(
  redirectLines.map((line) => {
    const [source, target] = line.trim().split(/\s+/);
    return [source, target];
  }),
);
for (const { source, target } of manifest.redirects) {
  const expectedTarget = target.startsWith("http")
    ? new URL(target).pathname
    : target;
  const actualTarget = redirects.get(source);
  if (!actualTarget) failures.push(`Missing redirect: ${source}`);
  else if (actualTarget !== expectedTarget) {
    failures.push(
      `Wrong redirect target for ${source}: expected ${expectedTarget}, got ${actualTarget}`,
    );
  }
}

for (const requiredFile of ["feed.xml", "_headers", "css/main.css"]) {
  if (!(await exists(requiredFile))) failures.push(`Missing required output: /${requiredFile}`);
}

const feed = await readFile(path.join(outputDirectory, "feed.xml"), "utf8");
const feedItemCount = [...feed.matchAll(/<item>/g)].length;
if (feedItemCount !== 10) failures.push(`Expected 10 RSS items, found ${feedItemCount}`);

const htmlFiles = [];
async function collectHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectHtml(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}
await collectHtml(outputDirectory);

let renderedTableClasses = 0;
for (const filename of htmlFiles) {
  const html = await readFile(filename, "utf8");
  if (/{%\s*(?:highlight|endhighlight|post_url|include)\b|\{\{\s*page\.title\s*\}\}/.test(html)) {
    failures.push(`Unconverted Jekyll Liquid markup in ${path.relative(outputDirectory, filename)}`);
  }
  if (/\{:\s*[^}]+\}/.test(html)) {
    failures.push(`Unconverted Jekyll Markdown attributes in ${path.relative(outputDirectory, filename)}`);
  }
  renderedTableClasses += [...html.matchAll(/<table\b[^>]*\bclass="[^"]*table-(?:small|with-minimal)-[^"]*"/g)].length;
}
if (renderedTableClasses === 0) failures.push("No Jekyll-formatted tables were rendered");
const deletionSemanticsPage = await readFile(
  path.join(outputDirectory, "blog", "why-deletion-means-different-things", "index.html"),
  "utf8",
);
if (!deletionSemanticsPage.includes('<table class="table-small-bordered top-bottom-padded">')) {
  failures.push("The deletion semantics table is missing its Jekyll formatting classes");
}

const verificationPage = await readFile(
  path.join(
    outputDirectory,
    "blog",
    "gaps-in-data-deletion-verification-auditability",
    "index.html",
  ),
  "utf8",
);
const diagramImage = verificationPage.match(
  /<img\b[^>]*\balt="Diagram illustrating what deletion succeeded actually measures"[^>]*>/,
)?.[0];
if (
  !diagramImage ||
  !/src="\/_astro\/20260612_WhatDeletionSuccessActuallyMeasures\.[^"]+\.svg"/.test(
    diagramImage,
  ) ||
  !/\bloading="eager"/.test(diagramImage) ||
  !/\bfetchpriority="high"/.test(diagramImage)
) {
  failures.push("The deletion verification diagram is not rendered as an eager Astro image");
}
const stylesheet = await readFile(path.join(outputDirectory, "css", "main.css"), "utf8");
if (!/img\s*\{[^}]*height:\s*auto;/.test(stylesheet)) {
  failures.push("Images are missing proportional height styling");
}

const sourceImageCount = (await readdir(path.join(root, "src", "assets", "images"))).length;
const publicImageCount = (await readdir(path.join(outputDirectory, "images"))).length;
if (publicImageCount < sourceImageCount) {
  failures.push(`Only ${publicImageCount} of ${sourceImageCount} image assets were copied`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${manifest.canonicalFiles.length} canonical pages, ${manifest.redirects.length} legacy redirects, ${feedItemCount} RSS items, and ${publicImageCount} images.`,
  );
}
