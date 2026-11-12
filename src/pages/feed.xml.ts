import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { categoriesFor, postUrl, sortPosts } from "../utils/blog";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async () => {
  const posts = sortPosts(await getCollection("posts")).slice(0, 10);
  const items = posts
    .map((post) => {
      if (!post.rendered) throw new Error(`Rendered content missing for ${post.id}`);
      const url = `https://www.marksayson.com${postUrl(post)}`;
      const categories = categoriesFor(post)
        .map((category) => `        <category>${escapeXml(category)}</category>`)
        .join("\n");
      return `      <item>
        <title>${escapeXml(post.data.title)}</title>
        <description>${escapeXml(post.rendered.html)}</description>
        <pubDate>${post.data.date.toUTCString()}</pubDate>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
${categories ? `${categories}\n` : ""}      </item>`;
    })
    .join("\n");
  const now = new Date().toUTCString();
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mark Sayson</title>
    <description>Notes on privacy engineering and distributed system verification.</description>
    <link>https://www.marksayson.com/</link>
    <atom:link href="https://www.marksayson.com/feed.xml" rel="self" type="application/rss+xml"/>
    <pubDate>${now}</pubDate>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>Astro</generator>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
