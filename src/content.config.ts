import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./.astro-content/posts",
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string().optional(),
    categories: z.union([z.string(), z.array(z.string())]).optional(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    redirect_from: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

export const collections = { posts };
