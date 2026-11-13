import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(root, ".migration", "jekyll-routes.json"), "utf8"),
);

async function readOutput(relativePath) {
  return readFile(path.join(outputDirectory, relativePath), "utf8");
}

async function collectHtml(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(fullPath)));
    else if (entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

test("build contains every canonical route from the legacy URL baseline", async () => {
  for (const route of manifest.canonicalFiles) {
    await access(path.join(outputDirectory, route.replace(/^\/+/, "")));
  }
});

test("Cloudflare redirects preserve the legacy URL targets", async () => {
  const lines = (await readOutput("_redirects")).trim().split(/\r?\n/);
  const redirects = new Map(
    lines.map((line) => {
      const [source, target] = line.trim().split(/\s+/);
      return [source, target];
    }),
  );

  for (const { source, target } of manifest.redirects) {
    const expectedTarget = target.startsWith("http")
      ? new URL(target).pathname
      : target;
    assert.equal(redirects.get(source), expectedTarget, `redirect ${source}`);
  }
});

test("required static resources and RSS feed are generated", async () => {
  for (const file of [
    "feed.xml",
    "_headers",
    "css/main.css",
    "search/index.html",
    "pagefind/pagefind.js",
    "pagefind/pagefind-component-ui.js",
    "pagefind/pagefind-component-ui.css",
  ]) {
    await access(path.join(outputDirectory, file));
  }

  const feed = await readOutput("feed.xml");
  assert.match(feed, /<rss\b/);
  assert.equal([...feed.matchAll(/<item>/g)].length, 10);

  const searchPage = await readOutput("search/index.html");
  assert.match(searchPage, /<pagefind-input\b/);
  assert.match(searchPage, /href="\/pagefind\/pagefind-component-ui\.css"/);
});

test("rendered pages contain no unconverted Jekyll syntax", async () => {
  const htmlFiles = await collectHtml(outputDirectory);
  let renderedTableCount = 0;

  for (const filename of htmlFiles) {
    const html = await readFile(filename, "utf8");
    const relativePath = path.relative(outputDirectory, filename);
    assert.doesNotMatch(
      html,
      /{%\s*(?:highlight|endhighlight|post_url|include)\b|\{\{\s*page\.title\s*\}\}/,
      relativePath,
    );
    assert.doesNotMatch(html, /\{:\s*[^}]+\}/, relativePath);
    renderedTableCount += [
      ...html.matchAll(/<table\b[^>]*\bclass="[^"]*table-(?:small|with-minimal)-[^"]*"/g),
    ].length;
  }

  assert.ok(renderedTableCount > 0, "expected Jekyll-formatted tables in output");
  const deletionSemanticsPage = await readOutput(
    "blog/why-deletion-means-different-things/index.html",
  );
  assert.match(
    deletionSemanticsPage,
    /<table class="table-small-bordered top-bottom-padded">/,
  );
});

test("blog excerpt images resolve to usable sources", async () => {
  const page = await readOutput("blog/page7/index.html");
  for (const imageName of [
    "20160606_terrykimura_stuffedanimals_facialrecognition.jpg",
    "20160606_vislab_followingaperson.jpg",
  ]) {
    assert.ok(page.includes(`src="/images/${imageName}"`), imageName);
  }
  assert.doesNotMatch(page, /__ASTRO_IMAGE_=/);
});

test("selected images use optimized output and the expected loading strategy", async () => {
  const eagerImages = [
    ["blog/gaps-in-data-deletion-verification-auditability/index.html", "Diagram illustrating what deletion succeeded actually measures", "20260612_WhatDeletionSuccessActuallyMeasures", "svg"],
    ["blog/why-data-deletion-is-still-unsolved/index.html", "Diagram illustrating data flow behind a deletion request", "20260530_TypicalDataFlowBehindDeletionRequestExcalidraw", "svg"],
    ["blog/aws-organization-members-cost-explorer-access/index.html", "Cost Explorer Screenshot", "20250510_CostExplorer", "webp"],
    ["about/index.html", "Mark Sayson", "profile_picture", "webp"],
    ["blog/setting-vim-colour-schemes/index.html", "alt text", "20161129_vimDefaultColourScheme", "webp"],
    ["blog/scalability-of-data-processing/index.html", "alt text", "20170404_singleSocket", "webp"],
    ["blog/concurrency-from-app-to-massively-distributed-service/index.html", "alt text", "20231130_DistributedComputeToHandleMillionTps-MultiThreadedApp", "webp"],
    ["blog/reviving-a-dead-laptop-with-linux/index.html", "alt-text", "20160515_lxlewebsite", "webp"],
    ["blog/security-engineering-by-ross-anderson/index.html", "Security Engineering - A Guide to Building Dependable Distributed Systems", "20160624_securityengineering_anderson_cover", "webp"],
    ["blog/advances-in-computer-vision-and-chasing-long-tail/index.html", "Facial recognition and stuffed animals", "20160606_terrykimura_stuffedanimals_facialrecognition", "webp"],
    ["blog/advances-in-computer-vision-and-chasing-long-tail/index.html", "Following a person - Vislab", "20160606_vislab_followingaperson", "webp"],
    ["blog/starting-out-on-debian/index.html", "alt text", "20160307_debian_family_tree", "webp"],
    ["blog/debian-setting-environment-variables/index.html", "alt-text", "20160324_go_version", "webp"],
    ["blog/lxde-customizing-the-log-in-background/index.html", "alt-text", "20160307_orion_nebula_nasa_images600", "webp"],
  ];

  for (const [file, alt, filename, extension] of eagerImages) {
    const html = await readOutput(file);
    const image = html.match(
      new RegExp(`<img\\b[^>]*\\balt="${alt}"[^>]*>`),
    )?.[0];
    assert.ok(image, `${file}: missing image ${alt}`);
    assert.match(image, new RegExp(`src="/_astro/${filename}\\.[^"]+\\.${extension}"`));
    assert.match(image, /\bloading="eager"/);
    assert.match(image, /\bfetchpriority="high"/);
  }

  const costExplorerPage = await readOutput(
    "blog/aws-organization-members-cost-explorer-access/index.html",
  );
  assert.doesNotMatch(costExplorerPage, /__ASTRO_IMAGE_=/);
  assert.doesNotMatch(costExplorerPage, /<img\s+<img\b/);
  for (const image of costExplorerPage.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\bsrc="\/_astro\//);
    assert.match(image[0], /\balt=/);
  }

  const securityPage = await readOutput(
    "blog/security-engineering-by-ross-anderson/index.html",
  );
  assert.match(securityPage, /href="https:\/\/www\.cl\.cam\.ac\.uk\/~rja14\/book\.html"[^>]*><img/);
  const epsonPage = await readOutput(
    "blog/epson-configuring-printers-on-linux/index.html",
  );
  assert.equal(
    [...epsonPage.matchAll(/<img\b[^>]*\bsrc="\/_astro\/20160516_printerconfig_/g)].length,
    7,
  );
  assert.match(epsonPage, /src="\/_astro\/20160516_printerconfig_7_printerready/);

  const lxdePage = await readOutput(
    "blog/lxde-customizing-the-log-in-background/index.html",
  );
  for (const imageName of [
    "20160307_cptodesktoppermissiondenied",
    "20160307_cptodesktopbasesuccess",
  ]) {
    const image = lxdePage.match(
      new RegExp(`<img\\b[^>]*\\bsrc="/_astro/${imageName}\\.[^"]+"[^>]*>`),
    )?.[0];
    assert.ok(image, `missing optimized ${imageName}`);
    assert.match(image, /\bloading="lazy"/);
  }

  const debianPage = await readOutput("blog/starting-out-on-debian/index.html");
  assert.match(debianPage, /href="https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/6\/69\/DebianFamilyTree1210\.svg"[^>]*><img src="\/_astro\//);
});
