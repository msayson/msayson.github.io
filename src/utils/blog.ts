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
  if (post.data.excerpt) return post.data.excerpt;

  const html = post.rendered?.html ?? "";
  const separator = html.indexOf("<!--more-->");
  if (separator >= 0) return html.slice(0, separator);

  const firstParagraph = html.match(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/i);
  return firstParagraph?.[0] ?? html;
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
