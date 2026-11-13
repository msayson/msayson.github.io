# Jekyll to Astro Migration

## Goal

Migrate the blog to Astro while preserving existing post URLs, content, and
static-site behavior. Keep the current domain and hosting provider, updating
only the build settings needed to deploy Astro.

## Status

- [x] **Step 1 — Capture the current site baseline**
  - Inventory generated URLs, post slugs, front matter, Liquid usage, and
    deployment configuration.
  - Record the current Jekyll build output as the parity reference.
- [x] **Step 2 — Set up Astro**
  - Add Astro with a static build while retaining current hosting assumptions.
- [x] **Step 3 — Port content and shared layout**
  - Render all `.markdown` and `.md` posts and standalone pages.
  - Recreate shared layouts, includes, styles, fonts, and assets.
  - Handle any Jekyll/Liquid constructs used inside post content.
- [x] **Step 4 — Recreate routes and site features**
  - Preserve `/blog/<slug>/` post URLs.
  - Implement the index and eight-post pagination, categories, `/feed.xml`,
    redirects, metadata, analytics, and Cloudflare headers.
- [x] **Step 5 — Validate parity**
  - Compare generated URLs and investigate every missing or changed route.
  - Check representative pages, images, feed, metadata, redirects, headers,
    and production build output.
- [ ] **Step 6 — Cut over Cloudflare Pages** *(pending external configuration)*
  - Set the Pages build command to `npm run build` and output directory to
    `dist`.
  - Deploy a preview and check it before switching the production build.

## Decisions and constraints

- Keep the existing domain and hosting provider; change only the build command
  and output directory required by Astro.
- Preserve existing URLs; use relevant permanent redirects only where exact
  preservation is impossible.
- Do not redesign the site as part of this migration.

## Progress log

- 2026-11-11: Created this migration checklist. Repository was clean before
  migration work began. A clean Jekyll baseline build succeeds and produces 114
  HTML files for 67 posts, nine blog index pages, home/about/categories pages,
  and legacy redirects. The current canonical post URL pattern is
  `/blog/<filename-slug>/`; old category/date-based URLs and `/page2`–`/page4`
  need redirects; the legacy root `/page2`–`/page4` aliases all redirect to
  `/blog/`. The site uses Liquid highlight, post_url, image, and table of
  contents includes in older posts. Jekyll writes to ignored `_site/`; Astro
  will build to `dist/` so both outputs can be compared.
- 2026-11-11: Baseline complete; Astro setup began.
- 2026-11-11: Added Astro 7 with static output, Sass, and front matter parsing.
  The original `_posts/` directory remains the canonical content source.
  Content/layout port began.
- 2026-11-11: Ported the shared layout, home/about pages, 67 post pages,
  category listing, nine-page paginated index, and RSS feed. The content
  preparation step converts the known Liquid constructs and copies static
  assets. Step 3 is complete; route/redirect work began.
- 2026-11-11: Captured the 79 canonical HTML output paths and 35 Jekyll
  redirect outputs in `jekyll-routes.json`. Astro builds the same 79 canonical
  pages; the parity check currently finds no missing routes or redirect target
  differences.
- 2026-11-11: Completed route recreation, Cloudflare redirects/headers, metadata,
  pagination, categories, and RSS. The saved parity check verifies all 79
  canonical outputs, 35 legacy redirect targets, 10 feed items, and 112 copied
  images. All 67 rendered post date labels match the Jekyll baseline.
- 2026-11-11: Clean `npm ci`, production `npm run build`, and the original
  route/content parity checks all succeeded. Development and production preview
  smoke tests returned HTTP 200 for home, post, category/feed, CSS, and image
  routes. The cutover itself is pending the Cloudflare Pages project settings
  and deployment preview.
- 2026-11-12: Replaced the one-off migration verifier with Node artifact tests
  and Playwright production-preview tests. The saved Jekyll route manifest
  remains as a compatibility baseline for routes and redirects.
