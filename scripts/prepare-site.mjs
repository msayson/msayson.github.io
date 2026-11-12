import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
import * as sass from "sass";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDirectory = path.join(root, "_posts");
const generatedPostsDirectory = path.join(root, ".astro-content", "posts");
const imageAssetsDirectory = path.join(root, "src", "assets", "images");
const publicDirectory = path.join(root, "public");
const sourceFiles = (await readdir(postsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(md|markdown)$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const postUrls = new Map(
  sourceFiles.map((name) => {
    const id = name.replace(/\.(md|markdown)$/, "");
    const slug = id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return [id, `/blog/${slug}/`];
  }),
);
const redirectMap = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function addRedirect(source, target) {
  const normalizedSource = source.startsWith("/") ? source : `/${source}`;
  if (normalizedSource === target) return;

  const existingTarget = redirectMap.get(normalizedSource);
  if (existingTarget && existingTarget !== target) {
    throw new Error(
      `Conflicting redirect for ${normalizedSource}: ${existingTarget} and ${target}`,
    );
  }
  redirectMap.set(normalizedSource, target);
}

function addJekyllRedirect(alias, target) {
  const normalizedAlias = alias.startsWith("/") ? alias : `/${alias}`;
  const pathWithoutTrailingSlash = normalizedAlias.replace(/\/+$/, "");

  addRedirect(normalizedAlias, target);
  if (!pathWithoutTrailingSlash || /\.html?$/i.test(pathWithoutTrailingSlash)) return;

  addRedirect(pathWithoutTrailingSlash, target);
  addRedirect(`${pathWithoutTrailingSlash}/`, target);
  addRedirect(`${pathWithoutTrailingSlash}.html`, target);
  addRedirect(`${pathWithoutTrailingSlash}/index.html`, target);
}

function renderImageInclude(attributes) {
  const values = Object.fromEntries(
    [...attributes.matchAll(/([\w-]+)="((?:\\.|[^"])*)"/g)].map((match) => [
      match[1],
      match[2].replaceAll('\\"', '"'),
    ]),
  );
  if (!values.img) throw new Error("An image.html include is missing its img attribute");

  if (!values.url) {
    const imagePath = `./images/${values.img.split("/").at(-1)}`;
    const title = values.title ?? "";
    const escapedTitle = title.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
    const image = `![${title.replaceAll("]", "\\]")}](${imagePath}${title ? ` "${escapedTitle}"` : ""})`;
    const caption = values.caption
      ? `\n\n<p class="image-caption">${escapeHtml(values.caption)}</p>`
      : "";
    return `${image}${caption}`;
  }

  const image = `<img src="${escapeHtml(values.img)}" alt="${escapeHtml(values.title ?? "")}"/>`;
  const content = `<a href="${escapeHtml(values.url)}" title="${escapeHtml(values.title ?? "")}" target="_blank">${image}</a>`;
  const caption = values.caption
    ? `\n  <p class="image-caption">${values.caption}</p>`
    : "";
  return `<div class="image-wrapper" >\n  ${content}${caption}\n</div>`;
}

function transformPostBody(body, data, filename, infoSecTableOfContents) {
  let transformed = body.replace(
    /{%\s*highlight\s+([^\s%]+)\s*%}\s*\r?\n([\s\S]*?)\r?\n\s*{%\s*endhighlight\s*%}/g,
    (_match, language, code) => `\`\`\`${language}\n${code.trimEnd()}\n\`\`\``,
  );

  transformed = transformed.replace(
    /{%\s*include\s+image\.html\s+([\s\S]*?)%}/g,
    (_match, attributes) => renderImageInclude(attributes),
  );
  transformed = transformed.replace(
    /{%\s*include\s+info-sec-principles-table-of-contents\.html\s*%}/g,
    infoSecTableOfContents,
  );
  transformed = transformed.replace(
    /{%\s*post_url\s+([^\s%]+)\s*%}/g,
    (_match, target) => {
      const targetId = target.replace(/\.(md|markdown)$/, "");
      const url = postUrls.get(targetId);
      if (!url) throw new Error(`${filename} links to unknown post ${target}`);
      return url;
    },
  );
  transformed = transformed.replace(
    /{{\s*page\.title\s*}}/g,
    escapeHtml(data.title ?? ""),
  );
  transformed = transformed.replace(
    /(!\[[^\]]*\]\()\/images\/([^)\s]+)([^)]*\))/g,
    "$1./images/$2$3",
  );
  if (/{%[^%]*%}|{{[\s\S]*?}}/.test(transformed)) {
    throw new Error(`${filename} contains an unhandled Jekyll Liquid expression`);
  }
  return transformed;
}

await rm(generatedPostsDirectory, { recursive: true, force: true });
await mkdir(generatedPostsDirectory, { recursive: true });
await cp(imageAssetsDirectory, path.join(generatedPostsDirectory, "images"), {
  recursive: true,
});

const infoSecTableOfContents = (
  await readFile(
    path.join(root, "src", "content", "info-sec-principles-table-of-contents.html"),
    "utf8",
  )
).trim();

for (const filename of sourceFiles) {
  const source = await readFile(path.join(postsDirectory, filename), "utf8");
  const parsed = matter(source);
  const body = transformPostBody(
    parsed.content,
    parsed.data,
    filename,
    infoSecTableOfContents,
  );
  const generated = matter.stringify(body, parsed.data);
  await writeFile(
    path.join(generatedPostsDirectory, filename.replace(/\.(md|markdown)$/, ".md")),
    generated,
    "utf8",
  );

  const target = postUrls.get(filename.replace(/\.(md|markdown)$/, ""));
  const aliases = parsed.data.redirect_from;
  for (const alias of Array.isArray(aliases) ? aliases : aliases ? [aliases] : []) {
    addJekyllRedirect(String(alias), target);
  }
}

for (const page of [2, 3, 4]) {
  addJekyllRedirect(`/page${page}`, "/blog/");
}
addJekyllRedirect("/categories", "/blog/categories/");

await mkdir(path.join(publicDirectory, "images"), { recursive: true });
await mkdir(path.join(publicDirectory, "css"), { recursive: true });
await cp(imageAssetsDirectory, path.join(publicDirectory, "images"), {
  recursive: true,
  force: true,
});
await cp(path.join(root, "css", "fonts"), path.join(publicDirectory, "css", "fonts"), {
  recursive: true,
  force: true,
});
const scssPath = path.join(root, "css", "main.scss");
const scss = await readFile(scssPath, "utf8");
await writeFile(
  path.join(publicDirectory, "css", "main.css"),
  sass.compileString(scss, {
    url: pathToFileURL(scssPath),
    loadPaths: [path.join(root, "_sass")],
  }).css,
  "utf8",
);
await cp(path.join(root, "_headers"), path.join(publicDirectory, "_headers"));
await writeFile(
  path.join(publicDirectory, "_redirects"),
  [...redirectMap]
    .sort(([sourceA], [sourceB]) => sourceA.localeCompare(sourceB))
    .map(([source, target]) => `${source} ${target} 301`)
    .join("\n") + "\n",
  "utf8",
);

console.log(
  `Prepared ${sourceFiles.length} posts, ${redirectMap.size} redirects, styles, images, and Cloudflare headers.`,
);
