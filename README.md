# Readme

This project contains the source code for Mark Sayson's personal blog:
[https://www.marksayson.com/](https://www.marksayson.com/)

Astro generates the static site from the Markdown posts in `_posts/`.
Image sources live in `src/assets/images/` so Astro can optimize them; the
build also copies originals to the existing `/images/` URLs for compatibility.
The Markdown pipeline translates legacy Jekyll block attributes to HTML classes,
preserving table and image formatting.

### Developer notes
#### Setting up a developer workspace
* Clone this repository to your preferred directory.
* Install [Node.js](https://nodejs.org/) 22.12 or newer.
* Run `npm ci` to install the locked dependencies.

#### Running the website locally
Run `npm run dev` and open the local URL printed by Astro. Changes to posts,
styles, images, and shared includes are regenerated during development.

#### Building and previewing
* Run `npm run build` to generate the static site and Pagefind search index in
  `dist/`.
* Run `npm run preview` to preview the production build locally.
* Run `npm test` to build the site, check generated files, and run browser tests
  against the production preview. Playwright runs Chromium; install its browser
  once with `npx playwright install chromium`.
* Search is available at `/search/` and indexes blog post content. The Pagefind
  index is generated as the final build step; it is not available in the
  development server until `npm run build` has run.

Cloudflare Pages can continue serving the site on the existing domain. Set its
build command to `npm run build` and its build output directory to `dist`.
Cloudflare Pages installs dependencies from `package-lock.json`; if dependency
installation is configured in the build command, use `npm ci && npm run build`.
The generated `_headers` and `_redirects` files preserve the current response
headers and legacy URL redirects.

#### Upgrading dependencies
Use `npm update` to update dependencies and `npm run build` to validate the
result. Commit the updated `package-lock.json` together with dependency changes.
