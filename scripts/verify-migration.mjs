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

const blogPageSeven = await readFile(
  path.join(outputDirectory, "blog", "page7", "index.html"),
  "utf8",
);
for (const imageName of [
  "20160606_terrykimura_stuffedanimals_facialrecognition.jpg",
  "20160606_vislab_followingaperson.jpg",
]) {
  if (!blogPageSeven.includes(`src="/images/${imageName}"`)) {
    failures.push(`The blog listing is missing the ${imageName} excerpt image`);
  }
}
if (blogPageSeven.includes("__ASTRO_IMAGE_=")) {
  failures.push("Astro image placeholders remain unrendered in the blog listing");
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
const aboutPage = await readFile(path.join(outputDirectory, "about", "index.html"), "utf8");
const profileImage = aboutPage.match(
  /<img\b[^>]*\balt="Mark Sayson"[^>]*>/,
)?.[0];
if (
  !profileImage ||
  !/src="\/_astro\/profile_picture\.[^"]+\.webp"/.test(profileImage) ||
  !/\bloading="eager"/.test(profileImage) ||
  !/\bfetchpriority="high"/.test(profileImage)
) {
  failures.push("The About profile picture is not rendered as an eager Astro image");
}
const deletionRequestPage = await readFile(
  path.join(outputDirectory, "blog", "why-data-deletion-is-still-unsolved", "index.html"),
  "utf8",
);
const deletionRequestImage = deletionRequestPage.match(
  /<img\b[^>]*\balt="Diagram illustrating data flow behind a deletion request"[^>]*>/,
)?.[0];
if (
  !deletionRequestImage ||
  !/src="\/_astro\/20260530_TypicalDataFlowBehindDeletionRequestExcalidraw\.[^"]+\.svg"/.test(
    deletionRequestImage,
  ) ||
  !/\bloading="eager"/.test(deletionRequestImage) ||
  !/\bfetchpriority="high"/.test(deletionRequestImage)
) {
  failures.push("The deletion request path diagram is not rendered as an eager Astro image");
}
const costExplorerPage = await readFile(
  path.join(outputDirectory, "blog", "aws-organization-members-cost-explorer-access", "index.html"),
  "utf8",
);
const costExplorerImage = costExplorerPage.match(
  /<img\b[^>]*\balt="Cost Explorer Screenshot"[^>]*>/,
)?.[0];
if (
  !costExplorerImage ||
  !/src="\/_astro\/20250510_CostExplorer\.[^"]+\.webp"/.test(costExplorerImage) ||
  !/\bloading="eager"/.test(costExplorerImage) ||
  !/\bfetchpriority="high"/.test(costExplorerImage)
) {
  failures.push("The Cost Explorer screenshot is not rendered as an eager Astro image");
}
if (costExplorerPage.includes("__ASTRO_IMAGE_=")) {
  failures.push("Astro image placeholders remain unrendered on the Cost Explorer post");
}
if (/<img\s+<img\b/.test(costExplorerPage)) {
  failures.push("The Cost Explorer post contains nested image tags");
}
for (const imageTag of costExplorerPage.matchAll(/<img\b[^>]*>/g)) {
  if (
    !/\bsrc="\/_astro\//.test(imageTag[0]) ||
    !/\balt=/.test(imageTag[0])
  ) {
    failures.push("The Cost Explorer post contains an unoptimized image or one missing alt text");
    break;
  }
}
for (const { page, alt, filename } of [
  {
    page: "setting-vim-colour-schemes",
    alt: "alt text",
    filename: "20161129_vimDefaultColourScheme",
  },
  {
    page: "scalability-of-data-processing",
    alt: "alt text",
    filename: "20170404_singleSocket",
  },
  {
    page: "concurrency-from-app-to-massively-distributed-service",
    alt: "alt text",
    filename: "20231130_DistributedComputeToHandleMillionTps-MultiThreadedApp",
  },
  {
    page: "reviving-a-dead-laptop-with-linux",
    alt: "alt-text",
    filename: "20160515_lxlewebsite",
  },
  {
    page: "security-engineering-by-ross-anderson",
    alt: "Security Engineering - A Guide to Building Dependable Distributed Systems",
    filename: "20160624_securityengineering_anderson_cover",
  },
  {
    page: "advances-in-computer-vision-and-chasing-long-tail",
    alt: "Facial recognition and stuffed animals",
    filename: "20160606_terrykimura_stuffedanimals_facialrecognition",
  },
  {
    page: "advances-in-computer-vision-and-chasing-long-tail",
    alt: "Following a person - Vislab",
    filename: "20160606_vislab_followingaperson",
  },
  {
    page: "starting-out-on-debian",
    alt: "alt text",
    filename: "20160307_debian_family_tree",
  },
  {
    page: "debian-setting-environment-variables",
    alt: "alt-text",
    filename: "20160324_go_version",
  },
  {
    page: "lxde-customizing-the-log-in-background",
    alt: "alt-text",
    filename: "20160307_orion_nebula_nasa_images600",
  },
]) {
  const pageHtml = await readFile(
    path.join(outputDirectory, "blog", page, "index.html"),
    "utf8",
  );
  const image = pageHtml.match(
    new RegExp(`<img\\b[^>]*\\bsrc="/_astro/${filename}\\.[^"]+"[^>]*>`),
  )?.[0];
  if (
    !image ||
    !image.includes(`alt="${alt}"`) ||
    !/\bloading="eager"/.test(image) ||
    !/\bfetchpriority="high"/.test(image)
  ) {
    failures.push(`The first image on ${page} is not rendered as an eager Astro image`);
  }
}
for (const { page, prefix, imageCount } of [
  {
    page: "security-engineering-by-ross-anderson",
    prefix: "20160624_securityengineering_anderson_cover",
    imageCount: 1,
  },
  {
    page: "epson-configuring-printers-on-linux",
    prefix: "20160516_printerconfig_",
    imageCount: 7,
  },
]) {
  const pageHtml = await readFile(
    path.join(outputDirectory, "blog", page, "index.html"),
    "utf8",
  );
  const images = [...pageHtml.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
  if (
    images.filter((image) => new RegExp(`src="/_astro/${prefix}`).test(image)).length <
    imageCount
  ) {
    failures.push(`Expected optimized Astro images are missing from ${page}`);
  }
  if (pageHtml.includes("__ASTRO_IMAGE_=") || /<img\s+<img\b/.test(pageHtml)) {
    failures.push(`Unresolved or malformed image markup remains on ${page}`);
  }
  if (
    page === "epson-configuring-printers-on-linux" &&
    !pageHtml.includes(`src="/_astro/20160516_printerconfig_7_printerready`)
  ) {
    failures.push("The final Epson printer image is not rendered as an Astro image");
  }
}
const debianPage = await readFile(
  path.join(outputDirectory, "blog", "starting-out-on-debian", "index.html"),
  "utf8",
);
if (
  !/src="\/_astro\/20160307_debian_family_tree\.[^"]+\.webp"/.test(debianPage) ||
  !debianPage.includes(
    'href="https://upload.wikimedia.org/wikipedia/commons/6/69/DebianFamilyTree1210.svg"',
  ) ||
  debianPage.includes("astro-image:")
) {
  failures.push("The Debian family tree is not rendered as a linked Astro image");
}
const lxdePage = await readFile(
  path.join(outputDirectory, "blog", "lxde-customizing-the-log-in-background", "index.html"),
  "utf8",
);
for (const imageName of [
  "20160307_cptodesktoppermissiondenied",
  "20160307_cptodesktopbasesuccess",
]) {
  const image = lxdePage.match(
    new RegExp(`<img\\b[^>]*\\bsrc="/_astro/${imageName}\\.[^"]+"[^>]*>`),
  )?.[0];
  if (!image || !/\bloading="lazy"/.test(image)) {
    failures.push(`The below-the-fold ${imageName} image is not lazy-loaded by Astro`);
  }
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
