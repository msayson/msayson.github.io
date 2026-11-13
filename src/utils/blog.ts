import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"posts">;

export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postUrl(post: BlogPost): string {
  return `/blog/${post.id}/`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

export function categoriesFor(post: BlogPost): string[] {
  const categories = post.data.categories;
  if (Array.isArray(categories)) return categories;
  return categories?.split(/\s+/).filter(Boolean) ?? [];
}

export function excerptHtml(post: BlogPost): string {
  let excerpt = post.data.excerpt;
  if (!excerpt) {
    const html = post.rendered?.html ?? "";
    const separator = html.indexOf("<!--more-->");
    excerpt =
      separator >= 0
        ? html.slice(0, separator)
        : (html.match(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/i)?.[0] ?? html);
  }

  return resolveAstroImagePlaceholders(excerpt);
}

export function resolveAstroImagePlaceholders(html: string): string {
  return html.replace(
    /<img\b[^>]*\b__ASTRO_IMAGE_="([^"]+)"[^>]*>/g,
    (_match, encodedImage) => {
      const parsed: unknown = JSON.parse(
        encodedImage
          .replaceAll("&quot;", '"')
          .replaceAll("&#x22;", '"')
          .replaceAll("&apos;", "'")
          .replaceAll("&#x27;", "'")
          .replaceAll("&amp;", "&")
          .replaceAll("&#x26;", "&"),
      );
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("src" in parsed) ||
        typeof parsed.src !== "string"
      ) {
        throw new Error("Invalid Astro image reference in rendered HTML");
      }

      const image = {
        src: parsed.src,
        alt:
          "alt" in parsed && typeof parsed.alt === "string"
            ? parsed.alt
            : undefined,
        title:
          "title" in parsed && typeof parsed.title === "string"
            ? parsed.title
            : undefined,
      };
      const source = image.src.startsWith("./images/")
        ? `/images/${image.src.slice("./images/".length)}`
        : image.src;
      const attributes = [
        `src="${escapeHtmlAttribute(source)}"`,
        image.alt !== undefined && `alt="${escapeHtmlAttribute(image.alt)}"`,
        image.title !== undefined && `title="${escapeHtmlAttribute(image.title)}"`,
      ].filter(Boolean);

      return `<img ${attributes.join(" ")}>`;
    },
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function descriptionFor(post: BlogPost): string {
  const description = excerptHtml(post)
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|quot|lt|gt|#39|nbsp);/g, (entity) => {
      const decoded: Record<string, string> = {
        "&amp;": "&",
        "&quot;": '"',
        "&lt;": "<",
        "&gt;": ">",
        "&#39;": "'",
        "&nbsp;": " ",
      };
      return decoded[entity] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();

  return description.length > 160
    ? `${description.slice(0, 157)}...`
    : description;
}
